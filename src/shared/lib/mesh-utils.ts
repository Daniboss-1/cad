import * as THREE from 'three';
import { MeshData } from '@/types/manifold';

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

  export function checkCollision(geometry: THREE.BufferGeometry, toolPosition: THREE.Vector3, toolRadius: number): boolean {
  const position = geometry.attributes.position;
  const tempVec = new THREE.Vector3();

  for (let i = 0; i < position.count; i++) {
  tempVec.fromBufferAttribute(position, i);
  if (tempVec.distanceTo(toolPosition) < toolRadius) {
  return true;
  }
  }
  return false;
  }
