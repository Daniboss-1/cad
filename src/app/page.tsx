'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import * as THREE from 'three';
import { 
  createBox, 
  createSphere, 
  createCylinder, 
  createTorus, 
  union, 
  difference,
  intersect,
  getMeshData, 
  MeshData 
} from '@/lib/cad';
import { meshToBufferGeometry } from '@/lib/mesh-utils';
import { useStore, CADNode } from '@/lib/store';
import Sidebar from '@/components/Sidebar';
import CommandK from '@/components/CommandK';

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
  const nodes = useStore((state) => state.nodes);

  const rebuildGeometry = useCallback(async () => {
    if (nodes.length === 0) {
      setGeometry(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setStatus('Excavating form...');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buildRecursive = async (index: number): Promise<any> => {
      if (index < 0) return null;

      const previous = await buildRecursive(index - 1);
      const node = nodes[index];

      if (!node.visible) return previous;

      // Create current primitive
      let current: any = null;
      try {
        switch (node.type) {
          case 'Box':
            current = await createBox(node.params as any);
            break;
          case 'Sphere':
            current = await createSphere(node.params as any);
            break;
          case 'Cylinder':
            current = await createCylinder(node.params as any);
            break;
          case 'Torus':
            current = await createTorus(node.params as any);
            break;
        }

        if (!previous) return current;

        let result: any = null;
        try {
          switch (node.operation) {
            case 'Add':
              result = await union(previous, current);
              break;
            case 'Subtract':
              result = await difference(previous, current);
              break;
            case 'Intersect':
              result = await intersect(previous, current);
              break;
            default:
              result = await union(previous, current);
          }
          return result;
        } finally {
          // Clean up intermediates
          if (previous && typeof previous.delete === 'function') previous.delete();
          if (current && typeof current.delete === 'function') current.delete();
        }
      } catch (err) {
        console.error(`Error building node ${index}:`, err);
        if (current && typeof current.delete === 'function') current.delete();
        return previous;
      }
    };

    try {
      const finalResult = await buildRecursive(nodes.length - 1);

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
    rebuildGeometry();
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
        <span style={{ opacity: 0.5 }}>[CMD+K] ADD PRIMITIVE</span>
      </header>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Viewport geometry={geometry} />
        </div>
        <Sidebar />
      </div>
      <CommandK />
    </main>
  );
}
