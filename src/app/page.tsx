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
  getMeshData, 
  MeshData 
} from '@/lib/cad';
import { meshToBufferGeometry } from '@/lib/mesh-utils';
import { useStore } from '@/lib/store';
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
        background: '#1a1a2e',
        color: '#ffffff',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      Loading CAD viewport...
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
    setStatus('Rebuilding geometry...');

    const manifoldsToDelete: any[] = [];
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let finalResult: any = null;

      for (const node of nodes) {
        if (!node.visible) continue;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let currentManifold: any = null;
        switch (node.type) {
          case 'Box':
            currentManifold = await createBox(node.params as any);
            break;
          case 'Sphere':
            currentManifold = await createSphere(node.params as any);
            break;
          case 'Cylinder':
            currentManifold = await createCylinder(node.params as any);
            break;
          case 'Torus':
            currentManifold = await createTorus(node.params as any);
            break;
        }

        if (currentManifold) {
          if (!finalResult) {
            finalResult = currentManifold;
          } else {
            const previousResult = finalResult;
            finalResult = await union(previousResult, currentManifold);
            manifoldsToDelete.push(previousResult);
            manifoldsToDelete.push(currentManifold);
          }
        }
      }

      if (finalResult) {
        const meshData: MeshData = await getMeshData(finalResult);
        const bufferGeometry = meshToBufferGeometry(meshData);
        setGeometry(bufferGeometry);
        manifoldsToDelete.push(finalResult);
      } else {
        setGeometry(null);
      }
    } catch (err) {
      console.error('Failed to rebuild geometry:', err);
      setStatus(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      // Clean up all manifolds
      for (const m of manifoldsToDelete) {
        try {
          if (m && typeof m.delete === 'function') {
            m.delete();
          }
        } catch (e) {
          // ignore
        }
      }
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
        background: '#1a1a2e',
      }}
    >
      <header
        style={{
          height: '40px',
          background: '#16213e',
          borderBottom: '1px solid #0f3460',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          color: '#e8e8e8',
          fontFamily: 'system-ui, sans-serif',
          fontSize: '14px',
          fontWeight: 500,
          gap: '20px',
          zIndex: 10,
        }}
      >
        <span style={{ color: '#4a90d9', fontWeight: 'bold' }}>Aether CAD</span>
        <span style={{ opacity: 0.6 }}>|</span>
        <span style={{ fontSize: '12px', opacity: 0.8 }}>Phase 0</span>
        {loading && (
          <>
            <span style={{ opacity: 0.6 }}>|</span>
            <span style={{ color: '#4a90d9' }}>{status}</span>
          </>
        )}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: '12px', opacity: 0.5 }}>Press Cmd+K to add primitives</span>
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
