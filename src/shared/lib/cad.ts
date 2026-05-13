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
  // Manifold 2.x+ supports smoothing via the 'smooth' method or 'smoothOut'.
  // For a general fillet simulation in the kernel:
  try {
    if ((mesh as any).smoothOut) {
      const result = (mesh as any).smoothOut(radius);
      return registry ? registry.register(result) : result;
    }

    if ((mesh as any).smooth) {
      // Some versions use smooth() with a refinement level
      const result = (mesh as any).smooth(3);
      return registry ? registry.register(result) : result;
    }
  } catch (e) {
    console.warn('Manifold fillet/smooth failed, falling back to original mesh', e);
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
