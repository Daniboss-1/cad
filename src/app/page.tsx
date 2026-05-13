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
  union, 
  difference,
  intersect,
  translate,
  rotate,
  scale,
  getMeshData, 
  MeshData 
} from '@/lib/cad';
import { meshToBufferGeometry } from '@/lib/mesh-utils';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import { useStore, CADNode } from '@/lib/store';
import Sidebar from '@/components/Sidebar';
import CommandK from '@/components/CommandK';
import BOMPanel from '@/components/BOMPanel';

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
                next = await difference(current, childMesh);
              } else if (op === 'Intersect') {
                next = await intersect(current, childMesh);
              } else {
                next = await union(current, childMesh);
              }
              if (next !== current && current.delete) current.delete();
              if (next !== childMesh && childMesh.delete) childMesh.delete();
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
            const next = await scale(current, scaleFactors);
            if (next !== current && current.delete) current.delete();
            current = next;
          }
          if (rotation.some(r => r !== 0)) {
            const next = await rotate(current, rotation);
            if (next !== current && current.delete) current.delete();
            current = next;
          }
          if (position.some(p => p !== 0)) {
            const next = await translate(current, position);
            if (next !== current && current.delete) current.delete();
            current = next;
          }
        }
        return current;
      } catch (err) {
        console.error(`Error building node ${node.id}:`, err);
        if (current && current.delete) current.delete();
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
            next = await difference(finalResult, nodeMesh);
          } else if (node.operation === 'Intersect') {
            next = await intersect(finalResult, nodeMesh);
          } else {
            next = await union(finalResult, nodeMesh);
          }
          if (next !== finalResult && finalResult.delete) finalResult.delete();
          if (next !== nodeMesh && nodeMesh.delete) nodeMesh.delete();
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
            textTransform: 'uppercase'
          }}
        >
          Export STL
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
