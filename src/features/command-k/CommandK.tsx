'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useStore, NodeType, AgentMessage } from '@/shared/lib/store';
import { parseIntent, Intent, OracleCore } from '@/shared/lib/oracle';
import { motion, AnimatePresence } from 'framer-motion';

export default function CommandK() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [suggestedIntent, setSuggestedIntent] = useState<Intent | null>(null);
  const { addNode, addMessage, messages } = useStore();
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
      setOracleResponse('Consulting Oracle Core...');

      addMessage({ role: 'user', content: search });
      const oracle = OracleCore.getInstance();
      const responses = await oracle.processNaturalLanguage(search);

      for (const res of responses) {
        setOracleResponse(`Waiting for ${res.agent}...`);
        await new Promise(r => setTimeout(r, 600)); // Simulate thinking
        addMessage({ role: 'assistant', agent: res.agent, content: res.content });
        if (res.action) res.action();
      }

      setIsOracleProcessing(false);
      setSearch('');
      setOpen(false);
      return;
    }

    if ((type as string) !== 'Oracle') {
      addNode(type as NodeType);
      setOpen(false);
      setSearch('');
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(1, 4, 9, 0.8)',
            backdropFilter: 'blur(12px)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            paddingTop: '15vh',
          }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            style={{
              width: '640px',
              background: '#0d1117',
              borderRadius: '16px',
              border: '1px solid #30363d',
              padding: '16px',
              boxShadow: '0 24px 64px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)',
              fontFamily: 'monospace',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 4px', borderBottom: '1px solid #21262d', marginBottom: '12px' }}>
              <span style={{ color: '#58a6ff', fontSize: '20px', fontWeight: 'bold' }}>›</span>
              <input
                ref={inputRef}
                placeholder="EXCAVATE PRIMITIVE OR CONSULT ORACLE..."
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
                  color: '#ffffff',
                  fontSize: '16px',
                  outline: 'none',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              />
            </div>

            <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {isOracleProcessing ? (
                <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                  <div style={{ color: '#58a6ff', fontSize: '11px', marginBottom: '16px', letterSpacing: '2px' }}>{oracleResponse?.toUpperCase()}</div>
                  <div style={{ width: '100%', height: '1px', background: '#21262d', position: 'relative', overflow: 'hidden' }}>
                    <motion.div
                      animate={{ left: ['-100%', '100%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      style={{
                        position: 'absolute',
                        width: '30%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, #58a6ff, transparent)',
                      }}
                    />
                  </div>
                </div>
              ) : (
                <>
                  {suggestedIntent && suggestedIntent.type !== 'UNKNOWN' && (
                    <div
                      onClick={() => handleSelect('Oracle', suggestedIntent)}
                      style={{
                        padding: '16px',
                        cursor: 'pointer',
                        background: 'linear-gradient(135deg, rgba(35, 134, 54, 0.2), rgba(35, 134, 54, 0.05))',
                        borderRadius: '12px',
                        marginBottom: '12px',
                        border: '1px solid rgba(46, 160, 67, 0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '10px', color: '#3fb950', fontWeight: 'bold', letterSpacing: '1px' }}>ORACLE SUGGESTION</span>
                        <span style={{ fontSize: '9px', color: '#484f58' }}>↵ EXECUTE</span>
                      </div>
                      <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: 600 }}>{suggestedIntent.message}</span>
                    </div>
                  )}

                  {filteredOptions.map((o, index) => (
                    <div
                      key={o.value}
                      onClick={() => handleSelect(o.value)}
                      style={{
                        padding: '12px 16px',
                        cursor: 'pointer',
                        color: selectedIndex === index ? '#ffffff' : '#8b949e',
                        background: selectedIndex === index ? 'rgba(33, 38, 45, 0.5)' : 'transparent',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.2s ease',
                        border: `1px solid ${selectedIndex === index ? '#30363d' : 'transparent'}`
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.5px' }}>{o.label.toUpperCase()}</span>
                        <span style={{ fontSize: '10px', opacity: 0.5 }}>{o.description.toUpperCase()}</span>
                      </div>
                      {selectedIndex === index && (
                        <span style={{ fontSize: '10px', color: '#58a6ff', fontWeight: 'bold' }}>SELECT</span>
                      )}
                    </div>
                  ))}

                  {filteredOptions.length === 0 && !suggestedIntent && search.length > 0 && (
                    <div
                      onClick={() => handleSelect('Oracle')}
                      style={{
                        padding: '16px',
                        cursor: 'pointer',
                        background: 'rgba(88, 166, 255, 0.1)',
                        borderRadius: '12px',
                        border: '1px solid rgba(88, 166, 255, 0.2)',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: '11px', color: '#58a6ff', fontWeight: 'bold', letterSpacing: '1px' }}>
                        CONSULT ORACLE FOR "{search.toUpperCase()}"
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div style={{
              marginTop: '16px',
              padding: '12px 4px 0',
              borderTop: '1px solid #21262d',
              fontSize: '9px',
              color: '#484f58',
              display: 'flex',
              gap: '16px',
              fontWeight: 600,
              letterSpacing: '0.5px'
            }}>
              <span>↑↓ NAVIGATE</span>
              <span>↵ SELECT</span>
              <span>ESC DISMISS</span>
              <span style={{ marginLeft: 'auto', color: '#30363d' }}>AETHER COMMAND INTERFACE V2</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
