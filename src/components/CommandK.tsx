'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useStore, NodeType } from '@/lib/store';

export default function CommandK() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const addNode = useStore((state) => state.addNode);
  const inputRef = useRef<HTMLInputElement>(null);

  const options: { label: string; value: NodeType | 'Oracle'; description: string }[] = [
    { label: 'Box', value: 'Box', description: 'Rectilinear volume excavation' },
    { label: 'Sphere', value: 'Sphere', description: 'Perfect orbital curvature' },
    { label: 'Cylinder', value: 'Cylinder', description: 'Extruded circular profile' },
    { label: 'Torus', value: 'Torus', description: 'Cyclic manifold ring' },
    { label: 'Oracle', value: 'Oracle', description: 'Generative Multi-agent Orchestration' },
  ];

  const filteredOptions = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  const [oracleResponse, setOracleResponse] = useState<string | null>(null);
  const [isOracleProcessing, setIsOracleProcessing] = useState(false);

  const handleSelect = async (type: NodeType | 'Oracle') => {
    if (type === 'Oracle') {
      setIsOracleProcessing(true);
      setOracleResponse('Oracle is consulting the Manifold spirits...');
      
      // Simulate Oracle Core Processing
      setTimeout(() => {
        setOracleResponse('PROMPT RECEIVED: "Create a 5x5 plate with a hole in the center"');
        setTimeout(() => {
          addNode('Box');
          // In a real implementation, we'd update params here too
          setOracleResponse('ORACLE: Form manifested. Adjusting stratigraphy...');
          setTimeout(() => {
            setOpen(false);
            setOracleResponse(null);
            setIsOracleProcessing(false);
          }, 1500);
        }, 1000);
      }, 1500);
      return;
    }
    addNode(type);
    setOpen(false);
    setSearch('');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(13, 17, 23, 0.8)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingTop: '15vh',
      }}
      onClick={() => setOpen(false)}
    >
      <div
        style={{
          width: '600px',
          background: '#161b22',
          border: '1px solid #30363d',
          borderRadius: '12px',
          padding: '12px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
          fontFamily: 'monospace',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px', borderBottom: '1px solid #30363d' }}>
          <span style={{ color: '#58a6ff', marginRight: '12px', fontSize: '20px' }}>›</span>
          <input
            ref={inputRef}
            placeholder="EXCAVATE PRIMITIVE..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: '#c9d1d9',
              fontSize: '16px',
              outline: 'none',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          />
        </div>
        <div style={{ marginTop: '8px', maxHeight: '400px', overflowY: 'auto' }}>
          {isOracleProcessing ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ color: '#58a6ff', fontSize: '12px', marginBottom: '10px', animation: 'pulse 2s infinite' }}>{oracleResponse}</div>
              <div style={{ width: '100%', height: '2px', background: '#21262d', position: 'relative', overflow: 'hidden' }}>
                <div style={{ 
                  position: 'absolute', 
                  width: '40%', 
                  height: '100%', 
                  background: '#58a6ff',
                  animation: 'shimmer 1.5s infinite linear'
                }} />
              </div>
              <style>{`
                @keyframes shimmer {
                  0% { left: -40%; }
                  100% { left: 100%; }
                }
                @keyframes pulse {
                  0% { opacity: 0.5; }
                  50% { opacity: 1; }
                  100% { opacity: 0.5; }
                }
              `}</style>
            </div>
          ) : (
            filteredOptions.map((o, index) => (
              <div
                key={o.value}
                onClick={() => handleSelect(o.value)}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  color: selectedIndex === index ? '#fff' : '#8b949e',
                  background: selectedIndex === index ? '#21262d' : 'transparent',
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.1s ease',
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{o.label.toUpperCase()}</span>
                  <span style={{ fontSize: '11px', opacity: 0.6 }}>{o.description}</span>
                </div>
                {selectedIndex === index && (
                  <span style={{ fontSize: '12px', color: '#58a6ff' }}>↵ ENTER</span>
                )}
              </div>
            ))
          )}
          {!isOracleProcessing && filteredOptions.length === 0 && (
            <div style={{ padding: '20px', color: '#484f58', textAlign: 'center', fontSize: '12px' }}>
              NO PRIMITIVES MATCH YOUR SEARCH
            </div>
          )}
        </div>
        <div style={{ 
          marginTop: '12px', 
          padding: '8px 12px', 
          borderTop: '1px solid #30363d', 
          fontSize: '10px', 
          color: '#484f58',
          display: 'flex',
          gap: '16px'
        }}>
          <span>↑↓ TO NAVIGATE</span>
          <span>↵ TO SELECT</span>
          <span>ESC TO DISMISS</span>
        </div>
      </div>
    </div>
  );
}
