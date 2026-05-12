'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import * as THREE from 'three';
import { createBox, createSphere, difference, getMeshData, deleteMesh } from '@/lib/cad';
import { meshToBufferGeometry } from '@/lib/mesh-utils';

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

  useEffect(() => {
    const createDemoGeometry = async () => {
      try {
        setStatus('Creating box primitive...');
        const box = await createBox({ width: 2, height: 2, depth: 2, center: true });

        setStatus('Creating sphere primitive...');
        const sphere = await createSphere({ radius: 1.2, segments: 32 });

        setStatus('Performing boolean difference operation...');
        const result = await difference(box, sphere);

        setStatus('Extracting mesh data...');
        const meshData = await getMeshData(result);

        setStatus('Converting to Three.js geometry...');
        const bufferGeometry = meshToBufferGeometry(meshData);

        setGeometry(bufferGeometry);
        setLoading(false);

        box.delete();
        sphere.delete();
        result.delete();
      } catch (err) {
        console.error('Failed to create geometry:', err);
        setStatus(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };

    createDemoGeometry();
  }, []);

  return (
    <main
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
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
        }}
      >
        <span style={{ color: '#4a90d9' }}>CAD</span>
        <span style={{ opacity: 0.6 }}>|</span>
        <span>Box - Sphere Difference Demo</span>
        {loading && (
          <>
            <span style={{ opacity: 0.6 }}>|</span>
            <span style={{ color: '#ffd700' }}>{status}</span>
          </>
        )}
      </header>
      <div style={{ flex: 1, position: 'relative' }}>
        <Viewport geometry={geometry} />
      </div>
    </main>
  );
}