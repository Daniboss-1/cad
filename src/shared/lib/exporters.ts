import * as THREE from 'three';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

export function exportToSTL(geometry: THREE.BufferGeometry, fileName: string = 'aether-cad-model.stl') {
  const exporter = new STLExporter();
  const mesh = new THREE.Mesh(geometry);
  const result = exporter.parse(mesh, { binary: true });

  const blob = new Blob([result as any], { type: 'application/octet-stream' });
  saveBlob(blob, fileName);
}

export function exportToGLTF(geometry: THREE.BufferGeometry, fileName: string = 'aether-cad-model.gltf') {
  const exporter = new GLTFExporter();
  const mesh = new THREE.Mesh(geometry);
  exporter.parse(mesh, (gltf) => {
    const blob = new Blob([JSON.stringify(gltf)], { type: 'application/json' });
    saveBlob(blob, fileName);
  }, (error) => {
    console.error('GLTF Export Error:', error);
  }, { binary: false });
}

function saveBlob(blob: Blob, fileName: string) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(link.href);
}
