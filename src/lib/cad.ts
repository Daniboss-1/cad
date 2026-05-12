import { getManifold, ManifoldModule, MeshOutput } from './manifold';

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

let manifoldModule: ManifoldModule | null = null;

async function ensureManifold(): Promise<ManifoldModule> {
  if (!manifoldModule) {
    manifoldModule = await getManifold();
  }
  return manifoldModule;
}

export async function createBox(params: BoxParams): Promise<ManifoldModule['Manifold']> {
  const m = await ensureManifold();
  return m.Manifold.cube([params.width, params.height, params.depth], params.center);
}

export async function createCylinder(params: CylinderParams): Promise<ManifoldModule['Manifold']> {
  const m = await ensureManifold();
  const { height, radiusLow, radiusHigh, segments, center } = params;
  return m.Manifold.cylinder(height, radiusLow, radiusHigh, segments, center);
}

export async function createSphere(params: SphereParams): Promise<ManifoldModule['Manifold']> {
  const m = await ensureManifold();
  const { radius, segments } = params;
  return m.Manifold.sphere(radius, segments);
}

export async function union(
  meshA: ManifoldModule['Manifold'],
  meshB: ManifoldModule['Manifold']
): Promise<ManifoldModule['Manifold']> {
  return meshA.add(meshB);
}

export async function difference(
  meshA: ManifoldModule['Manifold'],
  meshB: ManifoldModule['Manifold']
): Promise<ManifoldModule['Manifold']> {
  return meshA.subtract(meshB);
}

export async function intersect(
  meshA: ManifoldModule['Manifold'],
  meshB: ManifoldModule['Manifold']
): Promise<ManifoldModule['Manifold']> {
  return meshA.intersect(meshB);
}

export async function getMeshData(manifold: ManifoldModule['Manifold']): Promise<MeshOutput> {
  return manifold.getMesh() as MeshOutput;
}

export async function deleteMesh(manifold: ManifoldModule['Manifold']): Promise<void> {
  manifold.delete();
}