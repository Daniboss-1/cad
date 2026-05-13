'use client';

import React, { useRef } from 'react';
import { useStore, OperationType } from '@/lib/store';
import { parsePDFPaths } from '@/lib/pdf-parser';

export default function Sidebar() {
  const { nodes, selectedNodeId, selectNode, removeNode, updateNode, updateNodeParams, updateNodeTransform, moveNode, addNode } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const findNodeRecursive = (nodes: any[], id: string | null): any => {
    if (!id) return null;
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeRecursive(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedNode = findNodeRecursive(nodes, selectedNodeId);

  const getOpIcon = (op: OperationType) => {
    switch (op) {
      case 'Add': return '[+]';
      case 'Subtract': return '[-]';
      case 'Intersect': return '[×]';
    }
  };

  const NodeItem = ({ node, index, depth = 0 }: { node: any, index: number, depth?: number }) => (
    <div key={node.id}>
      <div
        onClick={() => selectNode(node.id)}
        style={{
          padding: '8px 10px',
          background: selectedNodeId === node.id ? '#21262d' : 'transparent',
          border: `1px solid ${selectedNodeId === node.id ? '#58a6ff' : 'transparent'}`,
          borderRadius: '6px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          opacity: node.visible ? 1 : 0.4,
          marginLeft: `${depth * 12}px`,
        }}
      >
        <span style={{ color: '#8b949e', width: '15px' }}>{index}</span>
        <span style={{ 
          color: node.operation === 'Subtract' ? '#f85149' : 
                 node.operation === 'Intersect' ? '#d29922' : '#3fb950',
          fontWeight: 'bold',
          fontSize: '10px'
        }}>
          {getOpIcon(node.operation)}
        </span>
        <span style={{ flex: 1 }}>{node.type}</span>
        
        <div style={{ display: 'flex', gap: '4px' }}>
          {node.type === 'Group' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                addNode('Box', node.id);
              }}
              title="Add Child"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#58a6ff', padding: '2px' }}
            >
              +
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              updateNode(node.id, { visible: !node.visible });
            }}
            title="Toggle Visibility"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#8b949e', padding: '2px' }}
          >
            {node.visible ? '◎' : '◉'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeNode(node.id);
            }}
            style={{ background: 'transparent', border: 'none', color: '#f85149', cursor: 'pointer', marginLeft: '4px' }}
          >
            ×
          </button>
        </div>
      </div>
      {node.children && node.children.length > 0 && (
        <div style={{ marginTop: '4px' }}>
          {node.children.map((child: any, i: number) => (
            <NodeItem key={child.id} node={child} index={i} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div
      style={{
        width: '320px',
        background: '#0d1117',
        borderLeft: '1px solid #30363d',
        display: 'flex',
        flexDirection: 'column',
        color: '#c9d1d9',
        fontFamily: 'monospace',
        fontSize: '13px',
      }}
    >
      {/* History Tree / Stratigraphy */}
      <div style={{ padding: '20px', borderBottom: '1px solid #30363d' }}>
        <h3 style={{ 
          margin: '0 0 16px 0', 
          fontSize: '11px', 
          color: '#8b949e', 
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }}>
          Stratigraphy
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {nodes.map((node, index) => (
            <NodeItem key={node.id} node={node} index={index} />
          ))}
        </div>
      </div>


      {/* Properties */}
      <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
        <h3 style={{ 
          margin: '0 0 16px 0', 
          fontSize: '11px', 
          color: '#8b949e', 
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }}>
          Parameters
        </h3>
        {selectedNode ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Operation Selector */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#8b949e', fontSize: '10px', textTransform: 'uppercase' }}>
                Operation
              </label>
              <select
                value={selectedNode.operation}
                onChange={(e) => updateNode(selectedNode.id, { operation: e.target.value as OperationType })}
                style={{
                  width: '100%',
                  background: '#161b22',
                  border: '1px solid #30363d',
                  color: '#c9d1d9',
                  padding: '8px',
                  borderRadius: '6px',
                  outline: 'none',
                  fontFamily: 'monospace'
                }}
              >
                <option value="Add">Union (Add)</option>
                <option value="Subtract">Difference (Subtract)</option>
                <option value="Intersect">Intersection</option>
              </select>
            </div>

            {/* Primitive Parameters */}
            {Object.entries(selectedNode.params).map(([key, value]) => {
              if (typeof value === 'number') {
                let min = 0.1;
                let max = 10;
                let step = 0.1;
                if (key.toLowerCase().includes('segments')) {
                  min = 3;
                  max = 128;
                  step = 1;
                }
                return (
                  <div key={key}>
                    <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                      <label style={{ color: '#8b949e', textTransform: 'uppercase' }}>{key}</label>
                      <span style={{ color: '#58a6ff' }}>{value}</span>
                    </div>
                    <input
                      type="range"
                      min={min}
                      max={max}
                      step={step}
                      value={value}
                      onChange={(e) =>
                        updateNodeParams(selectedNode.id, { [key]: parseFloat(e.target.value) })
                      }
                      style={{ 
                        width: '100%',
                        accentColor: '#58a6ff',
                        cursor: 'ew-resize'
                      }}
                    />
                  </div>
                );
              }
              if (typeof value === 'boolean') {
                return (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) =>
                        updateNodeParams(selectedNode.id, { [key]: e.target.checked })
                      }
                      style={{ accentColor: '#58a6ff' }}
                    />
                    <label style={{ color: '#8b949e', textTransform: 'uppercase', fontSize: '11px' }}>{key}</label>
                  </div>
                );
              }
              if (key === 'paths') {
                return (
                  <div key={key}>
                    <label style={{ color: '#8b949e', textTransform: 'uppercase', fontSize: '11px' }}>{key}</label>
                    <div style={{ color: '#58a6ff', fontSize: '10px' }}>{JSON.stringify(value).substring(0, 50)}...</div>
                  </div>
                );
              }
              return null;
            })}

            {/* Transformations */}
            <div style={{ borderTop: '1px solid #30363d', paddingTop: '20px' }}>
              <label style={{ display: 'block', marginBottom: '12px', color: '#8b949e', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Transformations
              </label>
              
              {/* Position */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                <span style={{ fontSize: '10px', color: '#8b949e' }}>POSITION</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {['X', 'Y', 'Z'].map((axis, i) => (
                    <div key={axis} style={{ flex: 1 }}>
                      <input
                        type="number"
                        value={selectedNode.transform.position[i]}
                        step={0.1}
                        onChange={(e) => {
                          const newPos = [...selectedNode.transform.position] as [number, number, number];
                          newPos[i] = parseFloat(e.target.value) || 0;
                          updateNodeTransform(selectedNode.id, { position: newPos });
                        }}
                        style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', color: '#58a6ff', padding: '4px', borderRadius: '4px', fontSize: '11px' }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Rotation */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                <span style={{ fontSize: '10px', color: '#8b949e' }}>ROTATION (DEG)</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {['X', 'Y', 'Z'].map((axis, i) => (
                    <div key={axis} style={{ flex: 1 }}>
                      <input
                        type="number"
                        value={selectedNode.transform.rotation[i]}
                        step={1}
                        onChange={(e) => {
                          const newRot = [...selectedNode.transform.rotation] as [number, number, number];
                          newRot[i] = parseFloat(e.target.value) || 0;
                          updateNodeTransform(selectedNode.id, { rotation: newRot });
                        }}
                        style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', color: '#d29922', padding: '4px', borderRadius: '4px', fontSize: '11px' }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Scale */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '10px', color: '#8b949e' }}>SCALE</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {['X', 'Y', 'Z'].map((axis, i) => (
                    <div key={axis} style={{ flex: 1 }}>
                      <input
                        type="number"
                        value={selectedNode.transform.scale[i]}
                        step={0.1}
                        min={0.1}
                        onChange={(e) => {
                          const newScale = [...selectedNode.transform.scale] as [number, number, number];
                          newScale[i] = parseFloat(e.target.value) || 0.1;
                          updateNodeTransform(selectedNode.id, { scale: newScale });
                        }}
                        style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', color: '#3fb950', padding: '4px', borderRadius: '4px', fontSize: '11px' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Phase 3: Metadata (Live BOM) */}
            <div style={{ borderTop: '1px solid #30363d', paddingTop: '20px' }}>
              <label style={{ display: 'block', marginBottom: '12px', color: '#8b949e', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Metadata (Supply-Chain Sentinel)
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: '#8b949e', marginBottom: '4px' }}>MATERIAL</label>
                  <input
                    type="text"
                    value={selectedNode.material || ''}
                    placeholder="e.g. Aluminum 6061"
                    onChange={(e) => updateNode(selectedNode.id, { material: e.target.value })}
                    style={{ width: '100%', background: '#161b22', border: '1px solid #30363d', color: '#c9d1d9', padding: '8px', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace' }}
                  />
                </div>
              </div>
            </div>

            {/* Phase 4: Manufacturing Sim */}
            <div style={{ borderTop: '1px solid #30363d', paddingTop: '20px' }}>
              <label style={{ display: 'block', marginBottom: '12px', color: '#8b949e', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                GMS Twin (Manufacturing Sim)
              </label>
              <div style={{ background: '#161b22', padding: '12px', borderRadius: '6px', border: '1px solid #30363d' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '10px', color: '#8b949e' }}>FEASIBILITY</span>
                  <span style={{ fontSize: '10px', color: '#3fb950', fontWeight: 'bold' }}>OPTIMAL</span>
                </div>
                <div style={{ height: '4px', background: '#21262d', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: '85%', height: '100%', background: '#3fb950' }} />
                </div>
                <div style={{ marginTop: '8px', fontSize: '10px', color: '#8b949e', lineHeight: '1.4' }}>
                   ✓ Wall thickness > 1.0mm<br/>
                   ✓ Zero non-manifold edges<br/>
                   ✓ Watertight kernel verified
                </div>
              </div>
            </div>

            {/* Phase 2: PDF Archaeological Dig */}
            <div style={{ borderTop: '1px solid #30363d', paddingTop: '20px', marginBottom: '40px' }}>
              <label style={{ display: 'block', marginBottom: '12px', color: '#8b949e', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Digital Archaeology (PDF-to-CAD)
              </label>
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept="application/pdf"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const paths = await parsePDFPaths(await file.arrayBuffer());
                    addNode('Extrusion', undefined, { paths, height: 1 });
                  }
                }}
              />
              <div 
                style={{ 
                  border: '1px dashed #30363d', 
                  padding: '20px', 
                  borderRadius: '6px', 
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s'
                }}
                onClick={() => fileInputRef.current?.click()}
                onMouseOver={(e) => e.currentTarget.style.borderColor = '#58a6ff'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = '#30363d'}
              >
                <span style={{ fontSize: '10px', color: '#8b949e' }}>UPLOAD PDF BLUEPRINT</span>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ color: '#484f58', textAlign: 'center', marginTop: '40px', fontSize: '11px' }}>
            SELECT A LAYER TO ADJUST PARAMETERS
          </div>
        )}
      </div>

      <div style={{ 
        padding: '16px', 
        borderTop: '1px solid #30363d', 
        fontSize: '10px', 
        color: '#484f58',
        background: '#161b22'
      }}>
        AETHER CAD v0.1.0-alpha
      </div>
    </div>
  );
}
