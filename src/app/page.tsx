'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import * as THREE from 'three';
import { 
  rebuildGeometryAsync,
  exportSTEPAsync,
  MeshData
} from '@/shared/lib/cad';
import { meshToBufferGeometry } from '@/shared/lib/mesh-utils';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { useStore } from '@/shared/lib/store';
import { findNodeRecursive } from '@/shared/lib/utils';
import { ViewportErrorBoundary } from '@/shared/ui/ViewportErrorBoundary';

const Sidebar = dynamic(() => import('@/widgets/sidebar/Sidebar'), { ssr: false });
const CommandK = dynamic(() => import('@/features/command-k/CommandK'), { ssr: false });
const BOMPanel = dynamic(() => import('@/widgets/bom/BOMPanel'), { ssr: false });

const Viewport = dynamic(() => import('@/entities/geometry/Viewport'), {
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

  const exportSTEP = async () => {
    setLoading(true);
    setStatus('Digital Alchemy: Transmuting to STEP...');
    try {
      const result = await exportSTEPAsync(nodes);
      if (result.status === 'SUCCESS') {
        const blob = new Blob([result.data], { type: 'application/step' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'aether-export.stp';
        link.click();
        setStatus('STEP Export Complete');
      }
    } catch (err) {
      console.error(err);
      setStatus('STEP Export Failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setStatus('Digital Archaeology in progress...');
    try {
      const { parseDigitalArchaeology } = await import('@/shared/lib/pdf-parser');
      const result = await parseDigitalArchaeology(file);
      useStore.getState().setArchaeologyResult(result);

      // Smart Lifting: Map dimensions to CAD parameters
      const detectedDimensions = result.dimensions.filter(d => d.confidence > 0.7);
      const mainHeight = detectedDimensions.find(d => d.text.toLowerCase().includes('h'))?.value || 10;

      result.paths.forEach((path) => {
        const manifoldPath = [path.points.map(p => [p[0], p[1]])];
        useStore.getState().addNode(
          'Extrusion',
          undefined,
          { paths: manifoldPath, height: mainHeight },
          { position: [0, 0, 0], rotation: [0,0,0], scale: [1,1,1] }
        );
      });
      console.log('Archaeology Audit Trail:', result.auditTrail);
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

    try {
      const meshData: MeshData | null = await rebuildGeometryAsync(nodes);
      if (meshData) {
        const bufferGeometry = meshToBufferGeometry(meshData);
        setGeometry(bufferGeometry);
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
          <span style={{ color: '#8b949e', textTransform: 'uppercase' }}>Kernel:</span>
          <span style={{ color: '#3fb950' }}>ACTIVE [WORKER]</span>
        </div>

        <span style={{ opacity: 0.2 }}>|</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#8b949e', textTransform: 'uppercase' }}>Current Phase:</span>
            <span style={{ color: '#58a6ff', fontWeight: 700 }}>2 [ARCHAEOLOGY ENGINE]</span>
          </div>
          <div style={{ height: '4px', width: '60px', background: 'rgba(48, 54, 61, 0.5)', borderRadius: '2px', position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '75%', background: '#58a6ff', borderRadius: '2px', boxShadow: '0 0 8px #58a6ff' }} />
          </div>
          <span style={{ color: '#8b949e', fontSize: '10px' }}>75% TO PHASE 3</span>
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
            {simMode ? 'Exit Simulation' : 'Geometric Sim'}
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
            <button
              onClick={exportSTEP}
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
              STEP
            </button>
          </div>

          <label
            style={{
              background: '#238636',
              color: 'white',
              padding: '6px 16px',
              borderRadius: '8px',
              fontSize: '10px',
              fontWeight: 700,
              cursor: 'pointer',
              textTransform: 'uppercase',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            Import PDF
            <input type="file" accept="application/pdf" onChange={handlePDFUpload} style={{ display: 'none' }} />
          </label>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        <Sidebar />

        <div style={{ flex: 1, position: 'relative', background: '#010409' }}>
          <ViewportErrorBoundary>
            <Viewport
              geometry={geometry}
              selectedNodeId={selectedNodeId}
              selectedNode={selectedNode}
              simMode={simMode}
            />
          </ViewportErrorBoundary>

          {selectedNode && (
            <div style={{
              position: 'absolute',
              bottom: '24px',
              left: '24px',
              background: 'rgba(22, 27, 34, 0.8)',
              backdropFilter: 'blur(20px)',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid rgba(48, 54, 61, 0.5)',
              color: '#8b949e',
              fontSize: '10px',
              fontFamily: 'monospace',
              pointerEvents: 'none'
            }}>
              <div style={{ color: '#58a6ff', marginBottom: '8px', fontWeight: 700 }}>NODE INSPECTOR</div>
              <div>ID: {selectedNode.id}</div>
              <div>TYPE: {selectedNode.type}</div>
              <div>POS: {selectedNode.transform.position.map(p => p.toFixed(2)).join(', ')}</div>
            </div>
          )}

          {simMode && <BOMPanel />}
        </div>

        <CommandK />
      </div>

      <footer style={{
        height: '24px',
        background: '#0d1117',
        borderTop: '1px solid #30363d',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        fontSize: '9px',
        color: '#484f58',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>CPU: 12%</span>
          <span>MEM: 450MB</span>
          <span>GPU: ACCELERATED</span>
        </div>
        <div>AETHER CAD v1.0.4-PRO</div>
      </footer>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}
