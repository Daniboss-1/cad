'use client';

import React, { useState, useEffect } from 'react';
import { useStore, NodeType } from '@/lib/store';

export default function CommandK() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const addNode = useStore((state) => state.addNode);

  const options: { label: string; value: NodeType }[] = [
    { label: 'Add Box', value: 'Box' },
    { label: 'Add Sphere', value: 'Sphere' },
    { label: 'Add Cylinder', value: 'Cylinder' },
    { label: 'Add Torus', value: 'Torus' },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!open) return null;

  const filteredOptions = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

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
        background: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingTop: '20vh',
      }}
      onClick={() => setOpen(false)}
    >
      <div
        style={{
          width: '500px',
          background: '#1a1a2e',
          border: '1px solid #0f3460',
          borderRadius: '8px',
          padding: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          placeholder="Search primitives... (e.g. Box, Torus)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            borderBottom: '1px solid #0f3460',
            color: '#fff',
            fontSize: '18px',
            padding: '10px',
            outline: 'none',
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && filteredOptions.length > 0) {
              handleSelect(filteredOptions[0].value);
            }
          }}
        />
        <div style={{ marginTop: '10px' }}>
          {filteredOptions.map((o) => (
            <div
              key={o.value}
              onClick={() => handleSelect(o.value)}
              style={{
                padding: '10px',
                cursor: 'pointer',
                color: '#e8e8e8',
                borderRadius: '4px',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#0f3460')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {o.label}
            </div>
          ))}
          {filteredOptions.length === 0 && (
            <div style={{ padding: '10px', color: '#666' }}>No results found</div>
          )}
        </div>
      </div>
    </div>
  );
}
