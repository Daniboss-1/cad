export interface ManifoldInstance {
  delete: () => void;
  add: (mesh: ManifoldInstance) => ManifoldInstance;
  subtract: (mesh: ManifoldInstance) => ManifoldInstance;
  intersect: (mesh: ManifoldInstance) => ManifoldInstance;
  translate: (v: [number, number, number]) => ManifoldInstance;
  rotate: (r: [number, number, number]) => ManifoldInstance;
  scale: (s: [number, number, number]) => ManifoldInstance;
  getMesh: () => any;
}
