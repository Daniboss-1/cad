'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import * as THREE from 'three';
import { 
  createBox, 
  createSphere, 
  createCylinder, 
  createTorus, 
  extrude,
  unionMesh, 
  subtractMesh,
  intersectMesh,
  translateMesh,
  rotateMesh,
  scaleMesh,
  getMeshData, 
  MeshData 
} from '@/lib/cad';
import { meshToBufferGeometry } from '@/lib/mesh-utils';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { useStore, CADNode } from '@/lib/store';
import Sidebar from '@/components/Sidebar';
import CommandK from '@/components/CommandK';
import BOMPanel from '@/components/BOMPanel';
import { parseDigitalArchaeology } from '@/lib/pdf-parser';

const Viewport = dynamic(() => import('@/components/Viewport'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0d1117',
        color: '#e8e8e8',
        fontFamily: 'monospace',
      }}
    >
      LOADING NEXUS VIEWPORT...
    </div>
  ),
});

export default function Home() {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Initializing...');
  const [simMode, setSimMode] = useState(false);
  const nodes = useStore((state) => state.nodes);
  const selectedNodeId = useStore((state) => state.selectedNodeId);
  const updateNodeTransform = useStore((state) => state.updateNodeTransform);

  const findNodeRecursive = (nodes: any[], id: string | null): any => {
    if (!id) return null;
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeRecursive(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };
  const selectedNode = findNodeRecursive(nodes, selectedNodeId);

  const exportSTL = () => {
    if (!geometry) return;
    const exporter = new STLExporter();
    const mesh = new THREE.Mesh(geometry);
    const result = exporter.parse(mesh);
    const blob = new Blob([result], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'aether-export.stl';
    link.click();
  };

  const exportGLTF = () => {
    if (!geometry) return;
    const exporter = new GLTFExporter();
    const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0x4a90d9 }));
    exporter.parse(mesh, (gltf) => {
      const blob = new Blob([JSON.stringify(gltf)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'aether-export.gltf';
      link.click();
    }, (err) => console.error(err));
  };

  const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    setStatus('Digital Archaeology in progress...');
    try {
      const result = await parseDigitalArchaeology(file);
      // Lift paths to CAD
      result.paths.forEach((path, i) => {
        const height = result.dimensions[0]?.value || 10;
        const manifoldPath = [path.points.map(p => [p[0], p[1]])];
        useStore.getState().addNode('Extrusion', undefined, { paths: manifoldPath, height });
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const rebuildGeometry = useCallback(async () => {
    if (nodes.length === 0) {
      setGeometry(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setStatus('Excavating form...');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buildNode = async (node: CADNode): Promise<any> => {
      if (!node.visible) return null;

      const isContainer = (type: string) => ['Group', 'Union', 'Subtract', 'Intersect'].includes(type);

      let current: any = null;
      try {
        if (isContainer(node.type) && node.children) {
          for (const child of node.children) {
            const childMesh = await buildNode(child);
            if (!childMesh) continue;
            if (!current) {
              current = childMesh;
            } else {
              let next: any;
              let op = child.operation;
              if (node.type === 'Subtract') op = 'Subtract';
              if (node.type === 'Intersect') op = 'Intersect';
              if (node.type === 'Union') op = 'Add';

              if (op === 'Subtract') {
                next = await subtractMesh(current, childMesh);
              } else if (op === 'Intersect') {
                next = await intersectMesh(current, childMesh);
              } else {
                next = await unionMesh(current, childMesh);
              }
              
              // Clean up intermediate meshes
              if (current && typeof current.delete === 'function') current.delete();
              if (childMesh && typeof childMesh.delete === 'function') childMesh.delete();
              current = next;
            }
          }
        } else {
          switch (node.type) {
            case 'Box':
              current = await createBox(node.params);
              break;
            case 'Sphere':
              current = await createSphere(node.params);
              break;
            case 'Cylinder':
              current = await createCylinder(node.params);
              break;
            case 'Torus':
              current = await createTorus(node.params);
              break;
            case 'Extrusion':
              current = await extrude(node.params.paths || [], node.params.height || 1);
              break;
          }
        }

        if (current) {
          const { position, rotation, scale: scaleFactors } = node.transform;
          if (scaleFactors.some(s => s !== 1)) {
            const next = await scaleMesh(current, scaleFactors);
            if (current && typeof current.delete === 'function') current.delete();
            current = next;
          }
          if (rotation.some(r => r !== 0)) {
            const next = await rotateMesh(current, rotation);
            if (current && typeof current.delete === 'function') current.delete();
            current = next;
          }
          if (position.some(p => p !== 0)) {
            const next = await translateMesh(current, position);
            if (current && typeof current.delete === 'function') current.delete();
            current = next;
          }
        }
        return current;
      } catch (err) {
        console.error(`Error building node ${node.id}:`, err);
        if (current && typeof current.delete === 'function') current.delete();
        return null;
      }
    };

    try {
      let finalResult: any = null;
      for (const node of nodes) {
        const nodeMesh = await buildNode(node);
        if (!nodeMesh) continue;
        if (!finalResult) {
          finalResult = nodeMesh;
        } else {
          let next: any;
          if (node.operation === 'Subtract') {
            next = await subtractMesh(finalResult, nodeMesh);
          } else if (node.operation === 'Intersect') {
            next = await intersectMesh(finalResult, nodeMesh);
          } else {
            next = await unionMesh(finalResult, nodeMesh);
          }
          
          if (finalResult && typeof finalResult.delete === 'function') finalResult.delete();
          if (nodeMesh && typeof nodeMesh.delete === 'function') nodeMesh.delete();
          finalResult = next;
        }
      }

      if (finalResult) {
        const meshData: MeshData = await getMeshData(finalResult);
        const bufferGeometry = meshToBufferGeometry(meshData);
        setGeometry(bufferGeometry);
        if (finalResult && typeof finalResult.delete === 'function') {
          finalResult.delete();
        }
      } else {
        setGeometry(null);
      }
    } catch (err) {
      console.error('Failed to rebuild geometry:', err);
      setStatus(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [nodes]);

  useEffect(() => {
    const timer = setTimeout(() => {
      rebuildGeometry();
    }, 200);
    return () => clearTimeout(timer);
  }, [rebuildGeometry]);

  return (
    <main
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#0d1117',
      }}
    >
      <header
        style={{
          height: '40px',
          background: '#161b22',
          borderBottom: '1px solid #30363d',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          color: '#e8e8e8',
          fontFamily: 'monospace',
          fontSize: '12px',
          fontWeight: 500,
          gap: '20px',
          zIndex: 10,
        }}
      >
        <span style={{ color: '#58a6ff', fontWeight: 'bold', letterSpacing: '1px' }}>AETHER CAD // NEXUS</span>
        <span style={{ opacity: 0.3 }}>|</span>
        <span style={{ opacity: 0.8, textTransform: 'uppercase' }}>Stratigraphy Mode</span>
        {loading && (
          <>
            <span style={{ opacity: 0.3 }}>|</span>
            <span style={{ color: '#d29922' }}>{status}</span>
          </>
        )}
        <div style={{ flex: 1 }} />
        <label style={{
            background: '#30363d',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: 'bold',
            cursor: 'pointer',
            textTransform: 'uppercase',
            marginRight: '10px'
          }}>
          Excavate PDF
          <input type="file" accept=".pdf" onChange={handlePDFUpload} style={{ display: 'none' }} />
        </label>
        <button 
          onClick={() => setSimMode(!simMode)}
          style={{
            background: simMode ? '#d29922' : '#30363d',
            border: 'none',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: 'bold',
            cursor: 'pointer',
            textTransform: 'uppercase',
            marginRight: '10px'
          }}
        >
          {simMode ? 'Exit Sim' : 'GMS Sim'}
        </button>
        <button 
          onClick={exportSTL}
          style={{
            background: '#238636',
            border: 'none',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: 'bold',
            cursor: 'pointer',
            textTransform: 'uppercase',
            marginRight: '10px'
          }}
        >
          STL
        </button>
        <button 
          onClick={exportGLTF}
          style={{
            background: '#238636',
            border: 'none',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: 'bold',
            cursor: 'pointer',
            textTransform: 'uppercase'
          }}
        >
          GLTF
        </button>
        <span style={{ opacity: 0.5, marginLeft: '10px' }}>[CMD+K] ADD PRIMITIVE</span>
      </header>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Viewport 
            geometry={geometry} 
            selectedNode={selectedNode}
            simMode={simMode}
            onUpdateTransform={(t) => updateNodeTransform(selectedNodeId!, t)}
          />
          <BOMPanel />
        </div>
        <Sidebar />
      </div>
      <CommandK />
    </main>
  );
}
