import { 
  ManifoldInstance, 
  ManifoldStatic, 
  MeshData, 
  CrossSectionInstance,
  ManifoldModule 
} from '../types/manifold';

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
  private resources: (ManifoldInstance | CrossSectionInstance)[] = [];

  register<T extends ManifoldInstance | CrossSectionInstance>(resource: T): T {
    this.resources.push(resource);
    return resource;
  }

  clear() {
    this.resources.forEach(res => {
      try {
        res.delete();
      } catch (e) {
        console.error('Failed to delete Manifold resource', e);
      }
    });
    this.resources = [];
  }
}

let manifoldModule: ManifoldModule | null = null;

async function ensureManifold(): Promise<ManifoldModule> {
  if (!manifoldModule) {
    const module = await import('manifold-3d');
    manifoldModule = await module.default();
  }
  return manifoldModule!;
}

export async function createBox(params: BoxParams, registry?: ManifoldRegistry): Promise<ManifoldInstance> {
  const { Manifold } = await ensureManifold();
  const mesh = Manifold.cube([params.width, params.height, params.depth], params.center);
  return registry ? registry.register(mesh) : mesh;
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
