'use client';

import React from 'react';
import { useStore } from '@/shared/lib/store';

export default function BOMPanel() {
  const nodes = useStore((state) => state.nodes);

  const materials = [
    { name: 'Aluminum 6061', density: 2.7, costPerKg: 5.5 },
    { name: 'Steel 1018', density: 7.87, costPerKg: 2.2 },
    { name: 'Titanium Ti-6Al-4V', density: 4.43, costPerKg: 45.0 },
    { name: 'ABS Plastic', density: 1.04, costPerKg: 3.5 },
  ];

  const calculateVolume = (node: any) => {
    // Highly simplified volume calculation for estimation
    // In a real app, we'd get this from Manifold-3D mesh.getProperties()
    const p = node.params as any;
    const s = node.transform.scale;
    let baseVolume = 0;
    switch (node.type) {
      case 'Box':
        baseVolume = p.width * p.height * p.depth;
        break;
      case 'Sphere':
        baseVolume = (4/3) * Math.PI * Math.pow(p.radius, 3);
        break;
      case 'Cylinder':
        baseVolume = Math.PI * Math.pow(p.radiusLow, 2) * p.height;
        break;
      case 'Torus':
        baseVolume = (Math.PI * Math.pow(p.tube, 2)) * (2 * Math.PI * p.radius);
        break;
    }
    return baseVolume * s[0] * s[1] * s[2];
  };

  const bomItems = nodes.filter(n => n.visible).map(node => {
    const volume = calculateVolume(node);
    const materialInfo = materials.find(m => node.material?.includes(m.name)) || materials[0];
    const weight = (volume * materialInfo.density) / 1000; // units adjustment
    const cost = weight * materialInfo.costPerKg;

    return {
      id: node.id,
      name: node.partNumber || `PART-${node.id.substring(0,4).toUpperCase()}`,
      type: node.type,
      material: node.material || 'Aluminum 6061 (Default)',
      weight: weight.toFixed(3),
      cost: cost.toFixed(2)
    };
  });

  const totalCost = bomItems.reduce((acc, item) => acc + parseFloat(item.cost), 0);
  const totalWeight = bomItems.reduce((acc, item) => acc + parseFloat(item.weight), 0);

  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '20px',
      width: '400px',
      background: 'rgba(22, 27, 34, 0.95)',
      border: '1px solid #30363d',
      borderRadius: '8px',
      padding: '16px',
      color: '#c9d1d9',
      fontFamily: 'monospace',
      fontSize: '11px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
      zIndex: 5,
      maxHeight: '300px',
      overflowY: 'auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid #30363d', paddingBottom: '8px' }}>
        <span style={{ color: '#58a6ff', fontWeight: 'bold' }}>SUPPLY-CHAIN SENTINEL // LIVE BOM</span>
        <span style={{ color: '#8b949e' }}>{bomItems.length} ITEMS</span>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', color: '#8b949e' }}>
            <th style={{ padding: '4px 0' }}>PART</th>
            <th>MATERIAL</th>
            <th style={{ textAlign: 'right' }}>KG</th>
            <th style={{ textAlign: 'right' }}>USD</th>
          </tr>
        </thead>
        <tbody>
          {bomItems.map((item) => (
            <tr key={item.id} style={{ borderTop: '1px solid #21262d' }}>
              <td style={{ padding: '6px 0' }}>{item.name}</td>
              <td style={{ color: '#8b949e' }}>{item.material.split(' ')[0]}</td>
              <td style={{ textAlign: 'right' }}>{item.weight}</td>
              <td style={{ textAlign: 'right', color: '#3fb950' }}>${item.cost}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '2px solid #30363d', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
        <span>TOTAL ESTIMATE</span>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#8b949e' }}>{totalWeight.toFixed(3)} KG</div>
          <div style={{ color: '#3fb950', fontSize: '14px' }}>${totalCost.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}
