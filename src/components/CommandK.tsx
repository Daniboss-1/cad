'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useStore, NodeType, AgentMessage } from '@/lib/store';
import { parseIntent, Intent } from '@/lib/oracle';
import { orchestrate } from '@/lib/oracle/orchestrator';

export default function CommandK() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [suggestedIntent, setSuggestedIntent] = useState<Intent | null>(null);
  const { addNode, updateNode, updateNodeParams, addMessage, messages, nodes, selectedNodeId } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (search.length > 2) {
      setSuggestedIntent(parseIntent(search));
    } else {
      setSuggestedIntent(null);
    }
  }, [search]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const options: { label: string; value: NodeType | 'Oracle'; description: string }[] = [
    { label: 'Box', value: 'Box', description: 'Rectilinear volume excavation' },
    { label: 'Sphere', value: 'Sphere', description: 'Perfect orbital curvature' },
    { label: 'Cylinder', value: 'Cylinder', description: 'Extruded circular profile' },
    { label: 'Torus', value: 'Torus', description: 'Cyclic manifold ring' },
    { label: 'Group', value: 'Group', description: 'Composite collection' },
    { label: 'Union', value: 'Union', description: 'Boolean additive merge' },
    { label: 'Subtract', value: 'Subtract', description: 'Boolean subtractive carve' },
    { label: 'Intersect', value: 'Intersect', description: 'Boolean intersection focus' },
    { label: 'Oracle', value: 'Oracle', description: 'Generative Multi-agent Orchestration' },
  ];

  const filteredOptions = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  const [oracleResponse, setOracleResponse] = useState<string | null>(null);
  const [isOracleProcessing, setIsOracleProcessing] = useState(false);

  const handleSelect = async (type: NodeType | 'Oracle', intent?: Intent | null) => {
    if (intent && intent.type === 'ADD_NODE' && intent.nodeType) {
      addNode(intent.nodeType, undefined, intent.params, intent.transform);
      setOpen(false);
      setSearch('');
      return;
    }

    if (type === 'Oracle' || (filteredOptions.length === 0 && search.length > 0)) {
      setIsOracleProcessing(true);
      
      await orchestrate(search, { nodes, selection: selectedNodeId }, (msg) => {
        addMessage(msg);
        if (msg.role === 'assistant' && msg.agent === 'Architect' && msg.content.includes('box')) {
           // Example of agent taking action
           addNode('Box');
        }
      });

      setIsOracleProcessing(false);
      setSearch('');
      return;
    }
    addNode(type as NodeType);
    setOpen(false);
    setSearch('');
  };

  if (!open) return null;

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
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (suggestedIntent && suggestedIntent.type === 'ADD_NODE') {
                  handleSelect('Oracle', suggestedIntent);
                } else if (filteredOptions[selectedIndex]) {
                  handleSelect(filteredOptions[selectedIndex].value);
                } else if (search.length > 0) {
                  handleSelect('Oracle');
                }
              }
              if (e.key === 'ArrowDown') {
                setSelectedIndex((s) => (s + 1) % Math.max(1, filteredOptions.length));
              }
              if (e.key === 'ArrowUp') {
                setSelectedIndex((s) => (s - 1 + filteredOptions.length) % Math.max(1, filteredOptions.length));
              }
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
        <div style={{ marginTop: '8px', maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ 
              padding: '8px 12px', 
              background: msg.role === 'user' ? '#0d1117' : '#1f242c',
              borderRadius: '6px',
              borderLeft: `3px solid ${msg.role === 'user' ? '#8b949e' : (msg.agent === 'Architect' ? '#58a6ff' : (msg.agent === 'Engineer' ? '#3fb950' : '#d29922'))}`
            }}>
              <div style={{ fontSize: '10px', color: '#8b949e', marginBottom: '4px', fontWeight: 'bold' }}>
                {msg.agent || msg.role.toUpperCase()}
              </div>
              <div style={{ fontSize: '12px', color: '#c9d1d9' }}>{msg.content}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
          
          {suggestedIntent && suggestedIntent.type !== 'UNKNOWN' && !isOracleProcessing && (
            <div
              onClick={() => handleSelect('Oracle', suggestedIntent)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                color: '#fff',
                background: '#238636',
                borderRadius: '6px',
                marginBottom: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                border: '1px solid #2ea043'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', opacity: 0.8 }}>SUGGESTED ACTION</span>
                <span style={{ fontSize: '10px' }}>↵ ENTER TO EXECUTE</span>
              </div>
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{suggestedIntent.message}</span>
            </div>
          )}
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
          {!isOracleProcessing && filteredOptions.length === 0 && !suggestedIntent && (
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
