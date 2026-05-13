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
const Sidebar = dynamic(() => import('@/components/Sidebar'), { ssr: false });
const CommandK = dynamic(() => import('@/components/CommandK'), { ssr: false });
const BOMPanel = dynamic(() => import('@/components/BOMPanel'), { ssr: false });

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
      const { parseDigitalArchaeology } = await import('@/lib/pdf-parser');
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
          height: '50px',
          background: 'rgba(22, 27, 34, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(48, 54, 61, 0.5)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          color: '#e8e8e8',
          fontFamily: 'monospace',
          fontSize: '11px',
          fontWeight: 600,
          gap: '24px',
          zIndex: 100,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '24px', height: '24px', background: 'linear-gradient(135deg, #58a6ff, #1f6feb)', borderRadius: '6px' }} />
          <span style={{ color: '#ffffff', fontWeight: 800, letterSpacing: '2px', fontSize: '14px' }}>AETHER</span>
        </div>
        
        <span style={{ opacity: 0.2 }}>|</span>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#8b949e', textTransform: 'uppercase' }}>Kernel Status:</span>
          <span style={{ color: '#3fb950' }}>ACTIVE [WASM]</span>
        </div>

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
            <div style={{ width: '12px', height: '12px', border: '2px solid #d29922', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <span style={{ color: '#d29922', letterSpacing: '1px' }}>{status.toUpperCase()}</span>
          </div>
        )}
        
        <div style={{ flex: 1 }} />
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => setSimMode(!simMode)}
            style={{
              background: simMode ? '#d29922' : 'rgba(48, 54, 61, 0.5)',
              border: '1px solid rgba(240, 246, 252, 0.1)',
              color: 'white',
              padding: '6px 16px',
              borderRadius: '8px',
              fontSize: '10px',
              fontWeight: 700,
              cursor: 'pointer',
              textTransform: 'uppercase',
              transition: 'all 0.2s',
              letterSpacing: '0.5px'
            }}
          >
            {simMode ? 'Exit Simulation' : 'Manufacturing Sim'}
          </button>
          
          <div style={{ display: 'flex', background: 'rgba(48, 54, 61, 0.3)', borderRadius: '8px', padding: '2px', border: '1px solid rgba(240, 246, 252, 0.05)' }}>
            <button 
              onClick={exportSTL}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#8b949e',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = '#ffffff')}
              onMouseOut={(e) => (e.currentTarget.style.color = '#8b949e')}
            >
              STL
            </button>
            <button 
              onClick={exportGLTF}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#8b949e',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = '#ffffff')}
              onMouseOut={(e) => (e.currentTarget.style.color = '#8b949e')}
            >
              GLTF
            </button>
          </div>
        </div>
        
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
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
