'use client';

import React from 'react';
import { useStore } from '@/lib/store';

export default function Sidebar() {
  const { nodes, selectedNodeId, selectNode, removeNode, updateNodeParams } = useStore();
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <div
      style={{
        width: '300px',
        background: '#16213e',
        borderLeft: '1px solid #0f3460',
        display: 'flex',
        flexDirection: 'column',
        color: '#e8e8e8',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '14px',
      }}
    >
      <div style={{ padding: '15px', borderBottom: '1px solid #0f3460' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#4a90d9' }}>History Tree</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {nodes.map((node) => (
            <div
              key={node.id}
              onClick={() => selectNode(node.id)}
              style={{
                padding: '8px 12px',
                background: selectedNodeId === node.id ? '#0f3460' : 'transparent',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>{node.type}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeNode(node.id);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ff4d4d',
                  cursor: 'pointer',
                  padding: '2px 5px',
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '15px', flex: 1, overflowY: 'auto' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#4a90d9' }}>Properties</h3>
        {selectedNode ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
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
                    <div style={{ marginBottom: '5px', display: 'flex', justifyContent: 'space-between' }}>
                      <label style={{ opacity: 0.8 }}>{key}</label>
                      <span>{value}</span>
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
                      style={{ width: '100%' }}
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
                    />
                    <label style={{ opacity: 0.8 }}>{key}</label>
                  </div>
                );
              }
              return null;
            })}
          </div>
        ) : (
          <div style={{ opacity: 0.5, fontStyle: 'italic' }}>No node selected</div>
        )}
      </div>
    </div>
  );
}
