import * as THREE from 'three';
import { MeshOutput } from './manifold';

export function meshToBufferGeometry(mesh: MeshOutput): THREE.BufferGeometry {
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