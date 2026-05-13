'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js';
import { checkCollision } from '@/shared/lib/mesh-utils';
import { CADNode } from '@/shared/lib/store';

interface ViewportProps {
  geometry: THREE.BufferGeometry | null;
  simMode?: boolean;
  selectedNodeId?: string | null;
  selectedNode?: CADNode | null;
  onSelectNode?: (id: string | null) => void;
  onUpdateTransform?: (transform: { position: [number, number, number], rotation: [number, number, number], scale: [number, number, number] }) => void;
}

export default function Viewport({
  geometry,
  simMode = false,
  selectedNodeId,
  selectedNode,
  onSelectNode,
  onUpdateTransform
}: ViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const outlinePassRef = useRef<OutlinePass | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const toolRef = useRef<THREE.Mesh | null>(null);
  const gizmoRef = useRef<TransformControls | null>(null);
  const ghostMeshRef = useRef<THREE.Mesh | null>(null);
  const frameRef = useRef<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x010409);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const outlinePass = new OutlinePass(new THREE.Vector2(width, height), scene, camera);
    outlinePass.edgeStrength = 4.0;
    outlinePass.edgeGlow = 0.5;
    outlinePass.edgeThickness = 1.0;
    outlinePass.visibleEdgeColor.set('#58a6ff');
    outlinePass.hiddenEdgeColor.set('#101010');
    composer.addPass(outlinePass);
    outlinePassRef.current = outlinePass;

    const gammaPass = new ShaderPass(GammaCorrectionShader);
    composer.addPass(gammaPass);
    composerRef.current = composer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    const gridHelper = new THREE.GridHelper(10, 20, 0x30363d, 0x161b22);
    scene.add(gridHelper);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const gizmo = new TransformControls(camera, renderer.domElement);
    gizmo.addEventListener('dragging-changed', (e) => {
      controls.enabled = !e.value;
    });
    scene.add(gizmo);
    gizmoRef.current = gizmo;

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      controls.update();

      if (simMode && toolRef.current && geometry) {
        const time = Date.now() * 0.002;
        toolRef.current.position.x = Math.sin(time) * 2;
        toolRef.current.position.z = Math.cos(time) * 2;

        const isColliding = checkCollision(geometry, toolRef.current.position, 0.1);
        (toolRef.current.material as THREE.MeshBasicMaterial).color.set(isColliding ? 0xff0000 : 0x00ff00);
      }

      if (composerRef.current) {
        composerRef.current.render();
      } else {
        renderer.render(scene, camera);
      }
    };

    animate();

    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
      composer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      container.innerHTML = '';
    };
  }, [simMode]);

  useEffect(() => {
    if (!sceneRef.current || !geometry) return;

    if (meshRef.current) {
      sceneRef.current.remove(meshRef.current);
      meshRef.current.geometry.dispose();
      (meshRef.current.material as THREE.Material).dispose();
    }

    const material = new THREE.MeshPhysicalMaterial({
      color: 0x58a6ff,
      metalness: 0.6,
      roughness: 0.2,
      envMapIntensity: 1.0,
    });

    const mesh = new THREE.Mesh(geometry, material);
    meshRef.current = mesh;
    sceneRef.current.add(mesh);

    if (simMode) {
      const toolGeo = new THREE.CylinderGeometry(0.05, 0.05, 2, 16);
      const toolMat = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.8 });
      const tool = new THREE.Mesh(toolGeo, toolMat);
      sceneRef.current.add(tool);
      toolRef.current = tool;
    }

    return () => {
      if (meshRef.current && sceneRef.current) {
        sceneRef.current.remove(meshRef.current);
      }
      if (toolRef.current && sceneRef.current) {
        sceneRef.current.remove(toolRef.current);
      }
    };
  }, [geometry, simMode]);

  useEffect(() => {
    if (!sceneRef.current || !gizmoRef.current) return;
    const gizmo = gizmoRef.current;
    const scene = sceneRef.current;

    if (ghostMeshRef.current) {
      scene.remove(ghostMeshRef.current);
      ghostMeshRef.current = null;
    }

    const isContainer = (type: string) => ['Group', 'Union', 'Subtract', 'Intersect', 'Fillet'].includes(type);

    if (selectedNode && !isContainer(selectedNode.type)) {
      const { position, rotation, scale } = selectedNode.transform;

      let geo;
      if (selectedNode.type === 'Box') {
        geo = new THREE.BoxGeometry((selectedNode.params as any).width || 1, (selectedNode.params as any).height || 1, (selectedNode.params as any).depth || 1);
      } else if (selectedNode.type === 'Sphere') {
        geo = new THREE.SphereGeometry((selectedNode.params as any).radius || 1, 16, 16);
      } else if (selectedNode.type === 'Cylinder') {
        geo = new THREE.CylinderGeometry((selectedNode.params as any).radiusHigh || 1, (selectedNode.params as any).radiusLow || 1, (selectedNode.params as any).height || 2, 16);
      } else if (selectedNode.type === 'Torus') {
        geo = new THREE.TorusGeometry((selectedNode.params as any).radius || 1, (selectedNode.params as any).tube || 0.4, 16, 100);
      } else {
        geo = new THREE.BoxGeometry(1, 1, 1);
      }

      const mat = new THREE.MeshBasicMaterial({ color: 0x58a6ff, wireframe: true, transparent: true, opacity: 0.3 });
      const ghost = new THREE.Mesh(geo, mat);
      ghost.position.set(position[0], position[1], position[2]);
      ghost.rotation.set(rotation[0] * Math.PI / 180, rotation[1] * Math.PI / 180, rotation[2] * Math.PI / 180);
      ghost.scale.set(scale[0], scale[1], scale[2]);

      ghostMeshRef.current = ghost;
      scene.add(ghost);
      gizmo.attach(ghost);

      if (outlinePassRef.current) {
        outlinePassRef.current.selectedObjects = [ghost];
      }

      const handleGizmoChange = () => {
        if (gizmo.object === ghost && onUpdateTransform) {
          onUpdateTransform({
            position: [ghost.position.x, ghost.position.y, ghost.position.z],
            rotation: [ghost.rotation.x * 180 / Math.PI, ghost.rotation.y * 180 / Math.PI, ghost.rotation.z * 180 / Math.PI],
            scale: [ghost.scale.x, ghost.scale.y, ghost.scale.z]
          });
        }
      };

      gizmo.addEventListener('change', handleGizmoChange);
      return () => {
        gizmo.removeEventListener('change', handleGizmoChange);
        gizmo.detach();
      };
    } else {
      gizmo.detach();
      if (outlinePassRef.current) {
        outlinePassRef.current.selectedObjects = [];
      }
    }
  }, [selectedNode, onUpdateTransform]);

  if (error) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d1117', color: '#f85149', fontFamily: 'monospace' }}>
        ERROR: {error.toUpperCase()}
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }} />
  );
}
