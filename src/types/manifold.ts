export interface MeshData {
  numVert: number;
  numTri: number;
  vertPos: Float32Array;
  vertNorm: Float32Array;
  vertUV: Float32Array;
  triVerts: Uint32Array;
}

export interface ManifoldInstance {
  translate(vector: [number, number, number]): ManifoldInstance;
  rotate(angles: [number, number, number]): ManifoldInstance;
  scale(factors: [number, number, number]): ManifoldInstance;
  add(other: ManifoldInstance): ManifoldInstance;
  subtract(other: ManifoldInstance): ManifoldInstance;
  intersect(other: ManifoldInstance): ManifoldInstance;
  getMesh(): MeshData;
  delete(): void;
}

export interface CrossSectionInstance {
  delete(): void;
}

export interface ManifoldStatic {
  cube(size: [number, number, number], center?: boolean): ManifoldInstance;
  cylinder(height: number, radiusLow: number, radiusHigh?: number, segments?: number, center?: boolean): ManifoldInstance;
  sphere(radius: number, segments?: number): ManifoldInstance;
  torus(radius: number, tube: number, radialSegments?: number, tubularSegments?: number): ManifoldInstance;
  extrude(section: CrossSectionInstance, height: number, nDivisions?: number, twistDegrees?: number, scale?: [number, number]): ManifoldInstance;
}

export interface CrossSectionStatic {
  new (paths: number[][][]): CrossSectionInstance;
}

export interface ManifoldModule {
  Manifold: ManifoldStatic;
  CrossSection: CrossSectionStatic;
}
