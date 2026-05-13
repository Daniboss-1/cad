import { create } from 'zustand';
import { BoxParams, SphereParams, CylinderParams, TorusParams } from './cad';

export type NodeType = 'Box' | 'Sphere' | 'Cylinder' | 'Torus' | 'Group' | 'Extrusion';
export type OperationType = 'Add' | 'Subtract' | 'Intersect';

export interface Transform {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export interface CADNode {
  id: string;
  type: NodeType;
  operation: OperationType;
  params: any;
  transform: Transform;
  visible: boolean;
  material?: string;
  partNumber?: string;
  children?: CADNode[];
}

interface CADState {
  nodes: CADNode[];
  selectedNodeId: string | null;
  addNode: (type: NodeType, parentId?: string, initialParams?: any) => void;
  removeNode: (id: string) => void;
  updateNode: (id: string, updates: Partial<CADNode>) => void;
  updateNodeParams: (id: string, params: any) => void;
  updateNodeTransform: (id: string, transform: Partial<Transform>) => void;
  selectNode: (id: string | null) => void;
  moveNode: (id: string, direction: 'up' | 'down') => void;
  reorderNodes: (nodes: CADNode[]) => void;
}

const getDefaultTransform = (): Transform => ({
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
});

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
    case 'Group':
      return {};
    case 'Extrusion':
      return { paths: [[[0,0],[10,0],[10,10],[0,10]]], height: 1 };
  }
};

export const useStore = create<CADState>((set) => ({
  nodes: [
    {
      id: 'default-box',
      type: 'Box',
      operation: 'Add',
      params: getDefaultParams('Box'),
      transform: getDefaultTransform(),
      visible: true,
    },
  ],
  selectedNodeId: 'default-box',
  addNode: (type, parentId, initialParams) => {
    const newNode: CADNode = {
      id: Math.random().toString(36).substring(7),
      type,
      operation: 'Add',
      params: initialParams || getDefaultParams(type),
      transform: getDefaultTransform(),
      visible: true,
      children: type === 'Group' ? [] : undefined,
    };
    set((state) => {
      if (!parentId) {
        return {
          nodes: [...state.nodes, newNode],
          selectedNodeId: newNode.id,
        };
      }
      const addRecursive = (nodes: CADNode[]): CADNode[] => {
        return nodes.map((n) => {
          if (n.id === parentId) {
            return { ...n, children: [...(n.children || []), newNode] };
          }
          if (n.children) {
            return { ...n, children: addRecursive(n.children) };
          }
          return n;
        });
      };
      return {
        nodes: addRecursive(state.nodes),
        selectedNodeId: newNode.id,
      };
    });
  },

  removeNode: (id) =>
    set((state) => {
      const removeRecursive = (nodes: CADNode[]): CADNode[] => {
        return nodes
          .filter((n) => n.id !== id)
          .map((n) => ({
            ...n,
            children: n.children ? removeRecursive(n.children) : undefined,
          }));
      };
      return {
        nodes: removeRecursive(state.nodes),
        selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
      };
    }),
  updateNode: (id, updates) =>
    set((state) => {
      const updateRecursive = (nodes: CADNode[]): CADNode[] => {
        return nodes.map((n) => {
          if (n.id === id) return { ...n, ...updates };
          if (n.children) return { ...n, children: updateRecursive(n.children) };
          return n;
        });
      };
      return { nodes: updateRecursive(state.nodes) };
    }),
  updateNodeParams: (id, params) =>
    set((state) => {
      const updateRecursive = (nodes: CADNode[]): CADNode[] => {
        return nodes.map((n) => {
          if (n.id === id) return { ...n, params: { ...n.params, ...params } };
          if (n.children) return { ...n, children: updateRecursive(n.children) };
          return n;
        });
      };
      return { nodes: updateRecursive(state.nodes) };
    }),
  updateNodeTransform: (id, transform) =>
    set((state) => {
      const updateRecursive = (nodes: CADNode[]): CADNode[] => {
        return nodes.map((n) => {
          if (n.id === id) return { ...n, transform: { ...n.transform, ...transform } };
          if (n.children) return { ...n, children: updateRecursive(n.children) };
          return n;
        });
      };
      return { nodes: updateRecursive(state.nodes) };
    }),

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
