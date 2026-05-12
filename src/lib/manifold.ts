import * as ManifoldModule from 'manifold-3d';

export type ManifoldModule = typeof ManifoldModule;

let manifoldPromise: Promise<ManifoldModule> | null = null;

export function getManifold(): Promise<ManifoldModule> {
  if (!manifoldPromise) {
    manifoldPromise = ManifoldModule.default();
  }
  return manifoldPromise;
}

export interface MeshOutput {
  numVert: number;
  numTri: number;
  vertPos: Float32Array;
  vertNorm: Float32Array;
  vertUV: Float32Array;
  triVerts: Uint32Array;
}