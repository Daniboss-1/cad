import { create } from 'zustand';
import { BoxParams, SphereParams, CylinderParams, TorusParams } from './cad';

export type NodeType = 'Box' | 'Sphere' | 'Cylinder' | 'Torus';

export interface CADNode {
  id: string;
  type: NodeType;
  params: BoxParams | SphereParams | CylinderParams | TorusParams;
  visible: boolean;
}

interface CADState {
  nodes: CADNode[];
  selectedNodeId: string | null;
  addNode: (type: NodeType) => void;
  removeNode: (id: string) => void;
  updateNodeParams: (id: string, params: any) => void;
  selectNode: (id: string | null) => void;
  reorderNodes: (nodes: CADNode[]) => void;
}

const getDefaultParams = (type: NodeType) => {
  switch (type) {
    case 'Box':
      return { width: 1, height: 1, depth: 1, center: true };
    case 'Sphere':
      return { radius: 1, segments: 32 };
    case 'Cylinder':
      return { height: 2, radiusLow: 1, radiusHigh: 1, segments: 32, center: true };
    case 'Torus':
      return { radius: 1, tube: 0.3, radialSegments: 32, tubularSegments: 32 };
  }
};

export const useStore = create<CADState>((set) => ({
  nodes: [
    {
      id: 'default-box',
      type: 'Box',
      params: getDefaultParams('Box'),
      visible: true,
    },
  ],
  selectedNodeId: 'default-box',
  addNode: (type) => {
    const newNode: CADNode = {
      id: Math.random().toString(36).substring(7),
      type,
      params: getDefaultParams(type),
      visible: true,
    };
    set((state) => ({
      nodes: [...state.nodes, newNode],
      selectedNodeId: newNode.id,
    }));
  },
  removeNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
    })),
  updateNodeParams: (id, params) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id ? { ...n, params: { ...n.params, ...params } } : n
      ),
    })),
  selectNode: (id) => set({ selectedNodeId: id }),
  reorderNodes: (nodes) => set({ nodes }),
}));
