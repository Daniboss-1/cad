// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ManifoldInstance = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ManifoldConstructor = any;

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

export interface MeshData {
  numVert: number;
  numTri: number;
  vertPos: Float32Array;
  vertNorm: Float32Array;
  vertUV: Float32Array;
  triVerts: Uint32Array;
}

let manifoldConstructor: ManifoldConstructor | null = null;

async function ensureManifold(): Promise<ManifoldConstructor> {
  if (!manifoldConstructor) {
    const module = await import('manifold-3d');
    const instance = await module.default();
    manifoldConstructor = instance.Manifold;
  }
  return manifoldConstructor;
}

export async function createBox(params: BoxParams): Promise<ManifoldInstance> {
  const Manifold = await ensureManifold();
  return Manifold.cube([params.width, params.height, params.depth], params.center);
}

export async function createCylinder(params: CylinderParams): Promise<ManifoldInstance> {
  const Manifold = await ensureManifold();
  const { height, radiusLow, radiusHigh, segments, center } = params;
  return Manifold.cylinder(height, radiusLow, radiusHigh, segments, center);
}

export async function createSphere(params: SphereParams): Promise<ManifoldInstance> {
  const Manifold = await ensureManifold();
  const { radius, segments } = params;
  return Manifold.sphere(radius, segments);
}

export async function createTorus(params: TorusParams): Promise<ManifoldInstance> {
  const Manifold = await ensureManifold();
  const { radius, tube, radialSegments, tubularSegments } = params;
  return Manifold.torus(radius, tube, radialSegments, tubularSegments);
}

export async function union(meshA: ManifoldInstance, meshB: ManifoldInstance): Promise<ManifoldInstance> {
  return meshA.add(meshB);
}

export async function difference(meshA: ManifoldInstance, meshB: ManifoldInstance): Promise<ManifoldInstance> {
  return meshA.subtract(meshB);
}

export async function intersect(meshA: ManifoldInstance, meshB: ManifoldInstance): Promise<ManifoldInstance> {
  return meshA.intersect(meshB);
}

export async function translate(mesh: ManifoldInstance, vector: [number, number, number]): Promise<ManifoldInstance> {
  return mesh.translate(vector);
}

export async function rotate(mesh: ManifoldInstance, angles: [number, number, number]): Promise<ManifoldInstance> {
  // Manifold rotate takes angles in degrees for each axis
  return mesh.rotate(angles);
}

export async function scale(mesh: ManifoldInstance, factors: [number, number, number]): Promise<ManifoldInstance> {
  return mesh.scale(factors);
}

export async function extrude(paths: number[][][], height: number): Promise<ManifoldInstance> {
  const module = await import('manifold-3d');
  const instance = await module.default();
  const CrossSection = instance.CrossSection;
  const Manifold = instance.Manifold;
  
  const section = new CrossSection(paths);
  const manifold = Manifold.extrude(section, height, 0, 0, [1, 1]);
  section.delete();
  return manifold;
}

export async function getMeshData(manifold: ManifoldInstance): Promise<MeshData> {
  return manifold.getMesh();
}

export async function deleteMesh(manifold: ManifoldInstance): Promise<void> {
  manifold.delete();
}
