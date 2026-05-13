import {
  ManifoldInstance,
  ManifoldStatic,
  MeshData,
  CrossSectionInstance,
  ManifoldModule
} from '@/types/manifold';

export type { MeshData };

export interface BoxParams {
  width: number;
  height: number;
  depth: number;
  center?: boolean;
}

export interface CylinderParams {
  height: number;
  radiusLow: number;
  radiusHigh?: number;
  segments?: number;
  center?: boolean;
}

export interface SphereParams {
  radius: number;
  segments?: number;
}

export interface TorusParams {
  radius: number;
  tube: number;
  radialSegments?: number;
  tubularSegments?: number;
}

export class ManifoldRegistry {
  private resources = new Set<ManifoldInstance | CrossSectionInstance>();

  register<T extends ManifoldInstance | CrossSectionInstance>(resource: T): T {
    this.resources.add(resource);
    return resource;
  }

  unregister<T extends ManifoldInstance | CrossSectionInstance>(resource: T): void {
    this.resources.delete(resource);
  }

  clear() {
    this.resources.forEach(res => {
      try {
        res.delete();
      } catch (e) {}
    });
    this.resources.clear();
  }
}

// Worker Interface
let worker: Worker | null = null;
const pendingRequests = new Map<string, { resolve: (val: any) => void, reject: (err: any) => void }>();

function getWorker(): Worker {
  if (typeof window === 'undefined') return null as any;
  if (worker) return worker;
  worker = new Worker(new URL('./manifold.worker.ts', import.meta.url));
  worker.onmessage = (e) => {
    const { id, result, error } = e.data;
    const pending = pendingRequests.get(id);
    if (pending) {
      if (error) pending.reject(new Error(error));
      else pending.resolve(result);
      pendingRequests.delete(id);
    }
  };
  return worker;
}

export async function rebuildGeometryAsync(nodes: any[]): Promise<MeshData | null> {
  const id = Math.random().toString(36).substring(7);
  const w = getWorker();
  if (!w) return null;
  return new Promise((resolve, reject) => {
    pendingRequests.set(id, { resolve, reject });
    w.postMessage({ type: 'REBUILD', nodes, id });
  });
}

export async function exportSTEPAsync(nodes: any[]): Promise<any> {
  const id = Math.random().toString(36).substring(7);
  const w = getWorker();
  if (!w) return null;
  return new Promise((resolve, reject) => {
    pendingRequests.set(id, { resolve, reject });
    w.postMessage({ type: 'EXPORT_STEP', nodes, id });
  });
}

// Fallback / Sync methods if needed for small tasks
let manifoldPromise: Promise<ManifoldModule> | null = null;

async function ensureManifold(): Promise<ManifoldModule> {
  if (!manifoldPromise) {
    manifoldPromise = (async () => {
      const module = await import('manifold-3d');
      const instance = await module.default();
      return instance as unknown as ManifoldModule;
    })();
  }
  return manifoldPromise;
}

export async function createBox(params: BoxParams, registry?: ManifoldRegistry): Promise<ManifoldInstance> {
  const { Manifold } = await ensureManifold();
  const mesh = Manifold.cube([params.width, params.height, params.depth], params.center);
  return registry ? registry.register(mesh) : mesh;
}

export async function filletMesh(mesh: ManifoldInstance, radius: number, registry?: ManifoldRegistry): Promise<ManifoldInstance> {
  try {
    if ((mesh as any).smoothOut) {
      const result = (mesh as any).smoothOut(radius);
      return registry ? registry.register(result) : result;
    }
  } catch (e) {
    console.warn('Manifold fillet/smooth failed', e);
  }
  return mesh;
}

export async function createCylinder(params: CylinderParams, registry?: ManifoldRegistry): Promise<ManifoldInstance> {
  const { Manifold } = await ensureManifold();
  const { height, radiusLow, radiusHigh, segments, center } = params;
  const mesh = Manifold.cylinder(height, radiusLow, radiusHigh, segments, center);
  return registry ? registry.register(mesh) : mesh;
}

export async function createSphere(params: SphereParams, registry?: ManifoldRegistry): Promise<ManifoldInstance> {
  const { Manifold } = await ensureManifold();
  const { radius, segments } = params;
  const mesh = Manifold.sphere(radius, segments);
  return registry ? registry.register(mesh) : mesh;
}

export async function createTorus(params: TorusParams, registry?: ManifoldRegistry): Promise<ManifoldInstance> {
  const { Manifold } = await ensureManifold();
  const { radius, tube, radialSegments, tubularSegments } = params;
  const mesh = Manifold.torus(radius, tube, radialSegments, tubularSegments);
  return registry ? registry.register(mesh) : mesh;
}

export async function translateMesh(mesh: ManifoldInstance, vector: [number, number, number], registry?: ManifoldRegistry): Promise<ManifoldInstance> {
  const result = mesh.translate(vector);
  return registry ? registry.register(result) : result;
}

export async function rotateMesh(mesh: ManifoldInstance, angles: [number, number, number], registry?: ManifoldRegistry): Promise<ManifoldInstance> {
  const result = mesh.rotate(angles);
  return registry ? registry.register(result) : result;
}

export async function scaleMesh(mesh: ManifoldInstance, factors: [number, number, number], registry?: ManifoldRegistry): Promise<ManifoldInstance> {
  const result = mesh.scale(factors);
  return registry ? registry.register(result) : result;
}

export async function unionMesh(meshA: ManifoldInstance, meshB: ManifoldInstance, registry?: ManifoldRegistry): Promise<ManifoldInstance> {
  const result = meshA.add(meshB);
  return registry ? registry.register(result) : result;
}

export async function subtractMesh(meshA: ManifoldInstance, meshB: ManifoldInstance, registry?: ManifoldRegistry): Promise<ManifoldInstance> {
  const result = meshA.subtract(meshB);
  return registry ? registry.register(result) : result;
}

export async function intersectMesh(meshA: ManifoldInstance, meshB: ManifoldInstance, registry?: ManifoldRegistry): Promise<ManifoldInstance> {
  const result = meshA.intersect(meshB);
  return registry ? registry.register(result) : result;
}

export async function extrude(paths: number[][][], height: number, registry?: ManifoldRegistry): Promise<ManifoldInstance> {
  const { Manifold, CrossSection } = await ensureManifold();
  const section = new CrossSection(paths);
  if (registry) registry.register(section);
  const manifold = Manifold.extrude(section, height, 0, 0, [1, 1]);
  if (registry) registry.register(manifold);
  if (!registry) section.delete();
  return manifold;
}

export async function getMeshData(manifold: ManifoldInstance): Promise<MeshData> {
  return manifold.getMesh();
}

export async function deleteMesh(manifold: ManifoldInstance): Promise<void> {
  manifold.delete();
}
