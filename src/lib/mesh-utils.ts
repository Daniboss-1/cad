import * as THREE from 'three';

export interface MeshData {
  numVert: number;
  numTri: number;
  vertPos: Float32Array;
  vertNorm: Float32Array;
  vertUV: Float32Array;
  triVerts: Uint32Array;
}

export function meshToBufferGeometry(mesh: MeshData): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(mesh.vertPos, 3)
  );

  if (mesh.vertNorm && mesh.vertNorm.length > 0) {
    geometry.setAttribute(
      'normal',
      new THREE.BufferAttribute(mesh.vertNorm, 3)
    );
  } else {
    geometry.computeVertexNormals();
  }

  if (mesh.vertUV && mesh.vertUV.length > 0) {
    geometry.setAttribute(
      'uv',
      new THREE.BufferAttribute(mesh.vertUV, 2)
    );
  }

  geometry.setIndex(new THREE.BufferAttribute(mesh.triVerts, 1));

  geometry.computeBoundingSphere();

  return geometry;
}
