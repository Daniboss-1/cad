'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { fetchVendorStatus, VendorData } from '@/lib/vendor-service';
import { motion, AnimatePresence } from 'framer-motion';

export default function BOMPanel() {
  const nodes = useStore((state) => state.nodes);
  const [vendorData, setVendorData] = useState<Record<string, VendorData>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const refreshBOM = async () => {
      setIsRefreshing(true);
      const items = flattenNodes(nodes).filter(n => n.visible && n.type !== 'Group' && n.sku);
      const newData: Record<string, VendorData> = {};
      
      for (const item of items) {
        if (item.sku) {
          const data = await fetchVendorStatus(item.sku);
          newData[item.id] = data;
        }
      }
      setVendorData(prev => ({ ...prev, ...newData }));
      setIsRefreshing(false);
    };

    refreshBOM();
  }, [nodes]);

  const materials = [
    { name: 'Aluminum 6061', density: 2.7, costPerKg: 5.5 },
    { name: 'Steel 1018', density: 7.87, costPerKg: 2.2 },
    { name: 'Titanium Ti-6Al-4V', density: 4.43, costPerKg: 45.0 },
    { name: 'ABS Plastic', density: 1.04, costPerKg: 3.5 },
  ];

  const calculateVolume = (node: any): number => {
    if (!node.visible) return 0;
    
    let baseVolume = 0;
    if (node.type === 'Group' && node.children) {
      node.children.forEach((child: any) => {
        const childVol = calculateVolume(child);
        if (child.operation === 'Subtract') {
          baseVolume -= childVol;
        } else if (child.operation === 'Intersect') {
          baseVolume = Math.min(baseVolume, childVol);
        } else {
          baseVolume += childVol;
        }
      });
    } else {
      const p = node.params as any;
      switch (node.type) {
        case 'Box':
          baseVolume = (p.width || 0) * (p.height || 0) * (p.depth || 0);
          break;
        case 'Sphere':
          baseVolume = (4/3) * Math.PI * Math.pow(p.radius || 0, 3);
          break;
        case 'Cylinder':
          baseVolume = Math.PI * Math.pow(p.radiusLow || 0, 2) * (p.height || 0);
          break;
        case 'Torus':
          baseVolume = (Math.PI * Math.pow(p.tube || 0, 2)) * (2 * Math.PI * (p.radius || 0));
          break;
        case 'Extrusion':
          baseVolume = 25 * (p.height || 1); // Estimated area 25 for mock
          break;
      }
    }
    const s = node.transform.scale;
    return Math.max(0, baseVolume * s[0] * s[1] * s[2]);
  };

  const flattenNodes = (nodes: any[]): any[] => {
    let result: any[] = [];
    nodes.forEach(n => {
      result.push(n);
      if (n.children) {
        result = [...result, ...flattenNodes(n.children)];
      }
    });
    return result;
  };

  const bomItems = flattenNodes(nodes).filter(n => n.visible && n.type !== 'Group').map(node => {
    const volume = calculateVolume(node);

    const materialInfo = materials.find(m => node.material?.includes(m.name)) || materials[0];
    const weight = (volume * materialInfo.density) / 1000; // units adjustment
    const cost = node.cost || (weight * materialInfo.costPerKg);

    return {
      id: node.id,
      name: node.partNumber || `PART-${node.id.substring(0,4).toUpperCase()}`,
      type: node.type,
      material: node.material || 'Aluminum 6061 (Default)',
      weight: weight.toFixed(3),
      cost: vendorData[node.id]?.price?.toFixed(2) || (typeof cost === 'number' ? cost.toFixed(2) : cost),
      vendor: vendorData[node.id]?.vendor || node.vendor || 'Generic',
      leadTime: vendorData[node.id]?.leadTime || node.leadTime || 'Stock',
      stock: vendorData[node.id]?.stock
    };
  });

  const totalCost = bomItems.reduce((acc, item) => acc + parseFloat(item.cost), 0);
  const totalWeight = bomItems.reduce((acc, item) => acc + parseFloat(item.weight), 0);

  return (
    <motion.div
    initial={{ x: -100, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    className="glassmorphism animate-luxury"
    style={{
    position: 'absolute',
    bottom: '20px',
    left: '20px',
    width: '400px',
    borderRadius: '12px',
    padding: '16px',
    color: '#c9d1d9',
    fontFamily: 'monospace',
    fontSize: '11px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
    zIndex: 5,
    maxHeight: '400px',
    overflowY: 'auto'
    }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isRefreshing ? '#d29922' : '#3fb950', animation: isRefreshing ? 'pulse 1s infinite' : 'none' }} />
          <span style={{ color: '#58a6ff', fontWeight: 'bold', letterSpacing: '0.5px' }}>SUPPLY-CHAIN SENTINEL</span>
        </div>
        <span style={{ color: '#8b949e', fontSize: '9px' }}>{bomItems.length} ACTIVE MANIFOLDS</span>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', color: '#8b949e', textTransform: 'uppercase', fontSize: '9px' }}>
            <th style={{ padding: '8px 0' }}>Part Spec</th>
            <th>Vendor</th>
            <th>Availability</th>
            <th style={{ textAlign: 'right' }}>Unit Cost</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {bomItems.map((item) => (
              <motion.tr 
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ borderTop: '1px solid #21262d' }}
              >
                <td style={{ padding: '10px 0' }}>
                  <div style={{ fontWeight: 'bold', color: '#f0f6fc' }}>{item.name}</div>
                  <div style={{ fontSize: '9px', color: '#8b949e' }}>{item.type} | {item.material}</div>
                </td>
                <td style={{ color: '#8b949e' }}>{item.vendor}</td>
                <td>
                  <div style={{ color: item.leadTime === 'Stock' || item.leadTime === '2 days' ? '#3fb950' : '#d29922' }}>
                  {item.leadTime}
                  {parseFloat(item.leadTime) > 3 && (
                  <span style={{ marginLeft: '4px', color: '#f85149', fontSize: '8px' }}>⚠️ DELAY RISK</span>
                  )}
                  </div>
                  {item.stock !== undefined && <div style={{ fontSize: '9px', opacity: 0.6 }}>{item.stock} in stock</div>}
                  </td>

              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>

      <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '2px solid #30363d', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
        <span>TOTAL ESTIMATE</span>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#8b949e' }}>{totalWeight.toFixed(3)} KG</div>
          <div style={{ color: '#3fb950', fontSize: '14px' }}>${totalCost.toFixed(2)}</div>
        </div>
      </div>
    </motion.div>
  );
}
