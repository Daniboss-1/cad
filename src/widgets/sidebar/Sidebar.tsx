'use client';

import React, { useRef, useState } from 'react';
import { useStore, OperationType, CADNode } from '@/shared/lib/store';
import { fetchVendorStatus } from '@/shared/lib/vendor-service';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Wrench, Database, Activity, Eye, EyeOff, ChevronUp, ChevronDown, Trash2, Plus, RefreshCw, AlertTriangle } from 'lucide-react';
import { findNodeRecursive } from '@/shared/lib/utils';

export default function Sidebar() {
  const {
    nodes,
    selectedNodeId,
    selectNode,
    removeNode,
    updateNode,
    updateNodeParams,
    updateNodeTransform,
    moveNode,
    addNode,
    archaeologyResult
  } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const selectedNode = findNodeRecursive(nodes, selectedNodeId);

  const getOpIcon = (op: OperationType) => {
    switch (op) {
      case 'Add': return '+';
      case 'Subtract': return '-';
      case 'Intersect': return '×';
    }
  };

  const isContainer = (type: string) => ['Group', 'Union', 'Subtract', 'Intersect', 'Fillet', 'Shell'].includes(type);

  const NodeItem = ({ node, index, depth = 0 }: { node: CADNode, index: number, depth?: number }) => (
    <div key={node.id} style={{ position: 'relative' }}>
      <div
        onClick={() => selectNode(node.id)}
        style={{
          padding: '8px 10px',
          background: selectedNodeId === node.id ? 'rgba(88, 166, 255, 0.1)' : 'transparent',
          border: `1px solid ${selectedNodeId === node.id ? 'rgba(88, 166, 255, 0.3)' : 'transparent'}`,
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          opacity: node.visible ? 1 : 0.4,
          marginLeft: `${depth * 12}px`,
          position: 'relative',
          zIndex: 1,
          transition: 'all 0.2s ease',
        }}
      >
        <span style={{
          color: node.operation === 'Subtract' ? '#f85149' :
                 node.operation === 'Intersect' ? '#d29922' : '#3fb950',
          fontWeight: 'bold',
          fontSize: '12px',
          width: '10px',
          textAlign: 'center'
        }}>
          {getOpIcon(node.operation)}
        </span>
        <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '11px', fontWeight: selectedNodeId === node.id ? 600 : 400 }}>
          {node.name || node.type.toUpperCase()}
        </span>

        <div style={{ display: 'flex', gap: '2px', opacity: selectedNodeId === node.id ? 1 : 0.5 }}>
          {isContainer(node.type) && (
            <button
              onClick={(e) => { e.stopPropagation(); addNode('Box', node.id); }}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#8b949e', padding: '4px' }}
            ><Plus size={12} /></button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); moveNode(node.id, 'up'); }}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#8b949e', padding: '4px' }}
          ><ChevronUp size={12} /></button>
          <button
            onClick={(e) => { e.stopPropagation(); updateNode(node.id, { visible: !node.visible }); }}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#8b949e', padding: '4px' }}
          >{node.visible ? <Eye size={12} /> : <EyeOff size={12} />}</button>
          <button
            onClick={(e) => { e.stopPropagation(); removeNode(node.id); }}
            style={{ background: 'transparent', border: 'none', color: 'rgba(248, 81, 73, 0.8)', cursor: 'pointer', padding: '4px' }}
          ><Trash2 size={12} /></button>
        </div>
      </div>
      {node.children && node.children.length > 0 && (
        <div style={{ marginTop: '2px', borderLeft: '1px solid #21262d', marginLeft: `${depth * 12 + 14}px` }}>
          {node.children.map((child, i) => (
            <NodeItem key={child.id} node={child} index={i} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ x: -320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      style={{
        width: '320px',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(13, 17, 23, 0.7)',
        backdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#c9d1d9',
        fontFamily: 'monospace',
        zIndex: 10,
      }}
    >
      <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '10px',
          color: '#8b949e',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 700
        }}>
          <Database size={14} color="#58a6ff" />
          Phase 1: Core Modeling
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxHeight: '30vh', overflowY: 'auto' }}>
          {nodes.map((node, index) => (
            <NodeItem key={node.id} node={node} index={index} />
          ))}
        </div>
      </div>

      <div style={{ padding: '24px 20px', flex: 1, overflowY: 'auto' }}>
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '10px',
          color: '#8b949e',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 700
        }}>
          <Wrench size={14} color="#d29922" />
          Stratigraphy Parameters
        </h3>

        <AnimatePresence mode="wait">
          {selectedNode ? (
            <motion.div
              key={selectedNode.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#8b949e', fontSize: '9px', textTransform: 'uppercase', fontWeight: 700 }}>Name</label>
                <input
                  type="text"
                  value={selectedNode.name || ''}
                  onChange={(e) => updateNode(selectedNode.id, { name: e.target.value })}
                  style={{
                    width: '100%',
                    background: '#0d1117',
                    border: '1px solid #30363d',
                    color: '#ffffff',
                    padding: '10px',
                    borderRadius: '8px',
                    outline: 'none',
                    fontSize: '12px',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#58a6ff'}
                  onBlur={(e) => e.target.style.borderColor = '#30363d'}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#8b949e', fontSize: '9px', textTransform: 'uppercase', fontWeight: 700 }}>Boolean Operation</label>
                <select
                  value={selectedNode.operation}
                  onChange={(e) => updateNode(selectedNode.id, { operation: e.target.value as OperationType })}
                  style={{
                    width: '100%',
                    background: '#0d1117',
                    border: '1px solid #30363d',
                    color: '#ffffff',
                    padding: '10px',
                    borderRadius: '8px',
                    outline: 'none',
                    fontSize: '12px',
                    appearance: 'none'
                  }}
                >
                  <option value="Add">UNION (+)</option>
                  <option value="Subtract">SUBTRACT (-)</option>
                  <option value="Intersect">INTERSECT (×)</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ display: 'block', color: '#8b949e', fontSize: '9px', textTransform: 'uppercase', fontWeight: 700 }}>Parameters</label>
                {Object.entries(selectedNode.params).map(([key, value]) => {
                  if (typeof value === 'number') {
                    let min = 0.1, max = 20, step = 0.1;
                    if (key.includes('segments')) { min = 3; max = 64; step = 1; }
                    return (
                      <div key={key}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '6px' }}>
                          <span style={{ color: '#8b949e' }}>{key.toUpperCase()}</span>
                          <span style={{ color: '#58a6ff', fontWeight: 'bold' }}>{value.toFixed(key.includes('segments') ? 0 : 2)}</span>
                        </div>
                        <input
                          type="range" min={min} max={max} step={step} value={value}
                          onChange={(e) => updateNodeParams(selectedNode.id, { [key]: parseFloat(e.target.value) })}
                          style={{ width: '100%', accentColor: '#58a6ff' }}
                        />
                      </div>
                    );
                  }
                  return null;
                })}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid #21262d', paddingTop: '16px' }}>
                <label style={{ display: 'block', color: '#8b949e', fontSize: '9px', textTransform: 'uppercase', fontWeight: 700 }}>Transformation</label>

                {['position', 'rotation', 'scale'].map((type) => (
                  <div key={type}>
                    <span style={{ fontSize: '9px', color: '#484f58', display: 'block', marginBottom: '8px' }}>{type.toUpperCase()}</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {['X', 'Y', 'Z'].map((axis, i) => (
                        <input
                          key={axis}
                          type="number"
                          value={(selectedNode.transform as any)[type][i]}
                          onChange={(e) => {
                            const current = [...(selectedNode.transform as any)[type]];
                            current[i] = parseFloat(e.target.value) || 0;
                            updateNodeTransform(selectedNode.id, { [type]: current });
                          }}
                          style={{
                            flex: 1,
                            background: '#0d1117',
                            border: '1px solid #30363d',
                            color: type === 'position' ? '#58a6ff' : type === 'rotation' ? '#d29922' : '#3fb950',
                            padding: '6px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            textAlign: 'center'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid #21262d', paddingTop: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#8b949e', fontSize: '9px', textTransform: 'uppercase', fontWeight: 700 }}>
                  <Package size={12} color="#3fb950" />
                  Phase 3: Manufacturing Intelligence
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={selectedNode.sku || ''}
                      placeholder="PART NUMBER (SKU)"
                      onChange={(e) => updateNode(selectedNode.id, { sku: e.target.value })}
                      style={{ width: '100%', background: '#0d1117', border: '1px solid #30363d', color: '#ffffff', padding: '10px', paddingRight: '40px', borderRadius: '8px', fontSize: '11px' }}
                    />
                    <button
                      disabled={isSyncing}
                      onClick={async () => {
                        if (selectedNode.sku) {
                          setIsSyncing(true);
                          const data = await fetchVendorStatus(selectedNode.sku);
                          updateNode(selectedNode.id, { vendor: data.vendor, cost: data.price, leadTime: data.leadTime });
                          setIsSyncing(false);
                        }
                      }}
                      style={{ position: 'absolute', right: '8px', top: '8px', background: 'transparent', border: 'none', color: '#58a6ff', cursor: 'pointer' }}
                    >
                      <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                    </button>
                  </div>
                  {selectedNode.vendor && (
                    <div style={{ fontSize: '10px', color: '#8b949e', background: 'rgba(63, 185, 80, 0.05)', padding: '8px', borderRadius: '6px', border: '1px solid rgba(63, 185, 80, 0.1)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Vendor</span><span style={{ color: '#ffffff' }}>{selectedNode.vendor}</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}><span>Price</span><span style={{ color: '#3fb950' }}>${selectedNode.cost}</span></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', color: '#3fb950' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3fb950' }} />
                        <span style={{ fontSize: '9px', fontWeight: 'bold' }}>SUPPLY CHAIN SENTINEL: OPTIMAL</span>
                      </div>
                    </div>
                  )}
                  {selectedNode.type === 'Box' && (
                    <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(210, 153, 34, 0.1)', border: '1px solid rgba(210, 153, 34, 0.2)', borderRadius: '8px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#d29922', marginBottom: '4px' }}>
                         <AlertTriangle size={12} />
                         <span style={{ fontSize: '9px', fontWeight: 'bold' }}>DFM ADVISORY</span>
                       </div>
                       <div style={{ fontSize: '9px', color: '#8b949e' }}>Sharp internal corners detected. Suggest applying 0.5mm Fillet for tool accessibility.</div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <div style={{ color: '#484f58', textAlign: 'center', marginTop: '48px', fontSize: '11px', letterSpacing: '0.5px' }}>
              NO NODE SELECTED<br/>SELECT FROM HIERARCHY
            </div>
          )}
        </AnimatePresence>
      </div>

      {archaeologyResult && (
        <div style={{ padding: '24px 20px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(0,0,0,0.2)' }}>
          <h3 style={{
            margin: '0 0 16px 0',
            fontSize: '10px',
            color: '#8b949e',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            fontWeight: 700
          }}>
            Archaeology Audit
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '9px', color: '#58a6ff', fontWeight: 600 }}>CONFIDENCE HEATMAP</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {archaeologyResult.dimensions.map((dim, i) => {
                const color = dim.confidence > 0.8 ? '#3fb950' : dim.confidence > 0.5 ? '#d29922' : '#f85149';
                return (
                  <div key={i} style={{
                    padding: '4px 8px',
                    background: `${color}22`,
                    border: `1px solid ${color}44`,
                    borderRadius: '4px',
                    fontSize: '9px',
                    color: color
                  }}>
                    {dim.text} ({(dim.confidence * 100).toFixed(0)}%)
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: '12px', fontSize: '9px', color: '#8b949e' }}>
              <div style={{ fontWeight: 600, marginBottom: '4px', color: '#c9d1d9' }}>AUDIT TRAIL</div>
              <div style={{ maxHeight: '100px', overflowY: 'auto', fontSize: '8px', opacity: 0.8 }}>
                {archaeologyResult.auditTrail.map((log, i) => (
                  <div key={i} style={{ marginBottom: '2px' }}>{log}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: '20px', background: 'rgba(1, 4, 9, 0.4)', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: '100%',
            background: 'transparent',
            border: '1px dashed rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '16px',
            color: '#8b949e',
            fontSize: '10px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontWeight: 700,
            letterSpacing: '1px'
          }}
          onMouseOver={(e) => { e.currentTarget.style.borderColor = '#58a6ff'; e.currentTarget.style.color = '#58a6ff'; }}
          onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.color = '#8b949e'; }}
        >
          PHASE 2: ARCHAEOLOGY ENGINE (PDF)
        </button>
        <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="application/pdf" />
      </div>

      <style jsx>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
}
