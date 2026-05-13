import { create } from 'zustand';
import { BoxParams, SphereParams, CylinderParams, TorusParams } from './cad';

export type NodeType = 'Box' | 'Sphere' | 'Cylinder' | 'Torus';
export type OperationType = 'Add' | 'Subtract' | 'Intersect';

export interface CADNode {
  id: string;
  type: NodeType;
  operation: OperationType;
  params: BoxParams | SphereParams | CylinderParams | TorusParams;
  visible: boolean;
}

interface CADState {
  nodes: CADNode[];
  selectedNodeId: string | null;
  addNode: (type: NodeType) => void;
  removeNode: (id: string) => void;
  updateNode: (id: string, updates: Partial<CADNode>) => void;
  updateNodeParams: (id: string, params: any) => void;
  selectNode: (id: string | null) => void;
  moveNode: (id: string, direction: 'up' | 'down') => void;
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
      operation: 'Add',
      params: getDefaultParams('Box'),
      visible: true,
    },
  ],
  selectedNodeId: 'default-box',
  addNode: (type) => {
    const newNode: CADNode = {
      id: Math.random().toString(36).substring(7),
      type,
      operation: 'Add',
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
  updateNode: (id, updates) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id ? { ...n, ...updates } : n
      ),
    })),
  updateNodeParams: (id, params) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id ? { ...n, params: { ...n.params, ...params } } : n
      ),
    })),
  selectNode: (id) => set({ selectedNodeId: id }),
  moveNode: (id, direction) =>
    set((state) => {
      const index = state.nodes.findIndex((n) => n.id === id);
      if (index === -1) return state;
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= state.nodes.length) return state;

      const newNodes = [...state.nodes];
      const [movedNode] = newNodes.splice(index, 1);
      newNodes.splice(newIndex, 0, movedNode);
      return { nodes: newNodes };
    }),
  reorderNodes: (nodes) => set({ nodes }),
}));
