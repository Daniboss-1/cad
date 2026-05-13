'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useStore, NodeType } from '@/lib/store';

export default function CommandK() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const addNode = useStore((state) => state.addNode);
  const inputRef = useRef<HTMLInputElement>(null);

  const options: { label: string; value: NodeType; description: string }[] = [
    { label: 'Box', value: 'Box', description: 'Rectilinear volume excavation' },
    { label: 'Sphere', value: 'Sphere', description: 'Perfect orbital curvature' },
    { label: 'Cylinder', value: 'Cylinder', description: 'Extruded circular profile' },
    { label: 'Torus', value: 'Torus', description: 'Cyclic manifold ring' },
  ];

  const filteredOptions = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
        setSearch('');
        setSelectedIndex(0);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }

      if (open) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((i) => (i + 1) % filteredOptions.length);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((i) => (i - 1 + filteredOptions.length) % filteredOptions.length);
        } else if (e.key === 'Enter' && filteredOptions.length > 0) {
          e.preventDefault();
          handleSelect(filteredOptions[selectedIndex].value);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, filteredOptions, selectedIndex]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  if (!open) return null;

  const handleSelect = (type: NodeType) => {
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
          {filteredOptions.map((o, index) => (
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
          ))}
          {filteredOptions.length === 0 && (
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
