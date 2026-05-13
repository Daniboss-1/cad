'use client';

import React from 'react';
import { useStore, OperationType } from '@/lib/store';

export default function Sidebar() {
  const { nodes, selectedNodeId, selectNode, removeNode, updateNode, updateNodeParams, moveNode } = useStore();
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  const getOpIcon = (op: OperationType) => {
    switch (op) {
      case 'Add': return '[+]';
      case 'Subtract': return '[-]';
      case 'Intersect': return '[×]';
    }
  };

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
            <div
              key={node.id}
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
                    moveNode(node.id, 'up');
                  }}
                  disabled={index === 0}
                  style={{ background: 'transparent', border: 'none', cursor: index === 0 ? 'default' : 'pointer', color: '#8b949e' }}
                >
                  ↑
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveNode(node.id, 'down');
                  }}
                  disabled={index === nodes.length - 1}
                  style={{ background: 'transparent', border: 'none', cursor: index === nodes.length - 1 ? 'default' : 'pointer', color: '#8b949e' }}
                >
                  ↓
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
              return null;
            })}
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
