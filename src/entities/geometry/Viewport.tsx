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
import { reachabilityVertexShader, reachabilityFragmentShader } from '@/shaders/reachability.glsl';

interface ViewportProps {
  geometry: THREE.BufferGeometry | null;
  simMode?: boolean;
  selectedNode?: any;
  onUpdateTransform?: (transform: any) => void;
}

export default function Viewport({ geometry, simMode = false, selectedNode, onUpdateTransform }: ViewportProps) {
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
    scene.background = new THREE.Color(0x1a1a2e);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const outlinePass = new OutlinePass(new THREE.Vector2(width, height), scene, camera);
    outlinePass.edgeStrength = 3.0;
    outlinePass.edgeGlow = 1.0;
    outlinePass.edgeThickness = 1.0;
    outlinePass.pulsePeriod = 2;
    outlinePass.visibleEdgeColor.set('#58a6ff');
    outlinePass.hiddenEdgeColor.set('#101010');
    composer.addPass(outlinePass);
    outlinePassRef.current = outlinePass;

    const gammaPass = new ShaderPass(GammaCorrectionShader);
    composer.addPass(gammaPass);
    composerRef.current = composer;

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    // Create a procedural environment map
    const sceneEnv = new THREE.Scene();
    const bgMat = new THREE.MeshBasicMaterial({ color: 0x1a1a2e, side: THREE.BackSide });
    const bgGeo = new THREE.SphereGeometry(100);
    const bgMesh = new THREE.Mesh(bgGeo, bgMat);
    sceneEnv.add(bgMesh);

    const light1 = new THREE.DirectionalLight(0xffffff, 2);
    light1.position.set(10, 10, 10);
    sceneEnv.add(light1);

    const light2 = new THREE.DirectionalLight(0x58a6ff, 1);
    light2.position.set(-10, 5, -10);
    sceneEnv.add(light2);

    const renderTarget = pmremGenerator.fromScene(sceneEnv);
    scene.environment = renderTarget.texture;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const spotLight = new THREE.SpotLight(0x58a6ff, 50);
    spotLight.position.set(-5, 10, -5);
    scene.add(spotLight);

    const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
    scene.add(gridHelper);

    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // Orientation Gizmo
    const gizmoSize = 100;
    const gizmoScene = new THREE.Scene();
    const gizmoCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    const gizmoAxes = new THREE.AxesHelper(50);
    gizmoScene.add(gizmoAxes);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0, 0);

    const gizmo = new TransformControls(camera, renderer.domElement);
    gizmo.addEventListener('dragging-changed', (event) => {
      controls.enabled = !event.value;
    });
    gizmoRef.current = gizmo;
    scene.add(gizmo);

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      controls.update();

      const currentWidth = container.clientWidth;
      const currentHeight = container.clientHeight;

      // Simulation Tool Animation
      if (simMode && toolRef.current && geometry) {
        const time = Date.now() * 0.002;
        toolRef.current.position.x = Math.sin(time) * 2;
        toolRef.current.position.z = Math.cos(time) * 2;

        const isColliding = checkCollision(geometry, toolRef.current.position, 0.1);
        if (Array.isArray(toolRef.current.material)) {
          (toolRef.current.material[0] as THREE.MeshBasicMaterial).color.set(isColliding ? 0xff0000 : 0x00ff00);
        } else {
          (toolRef.current.material as THREE.MeshBasicMaterial).color.set(isColliding ? 0xff0000 : 0x00ff00);
        }
      }

      if (composerRef.current) {
        composerRef.current.render();
      } else {
        renderer.render(scene, camera);
      }

      // Render Gizmo
      renderer.autoClear = false;
      gizmoCamera.position.copy(camera.position);
      gizmoCamera.position.setLength(150);
      gizmoCamera.lookAt(0, 0, 0);

      const v = renderer.getViewport(new THREE.Vector4());
      renderer.setViewport(currentWidth - gizmoSize, 0, gizmoSize, gizmoSize);
      renderer.render(gizmoScene, gizmoCamera);
      renderer.setViewport(v);
      renderer.autoClear = true;
    };

    animate();

    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
      if (composerRef.current) {
        composerRef.current.setSize(newWidth, newHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [simMode, geometry]);

  useEffect(() => {
    if (!sceneRef.current) return;

    if (meshRef.current) {
      sceneRef.current.remove(meshRef.current);
      meshRef.current.geometry.dispose();
      if (Array.isArray(meshRef.current.material)) {
        meshRef.current.material.forEach((m) => m.dispose());
      } else {
        meshRef.current.material.dispose();
      }
      meshRef.current = null;
    }

    if (!geometry) return;

    if (simMode) {
      // Add Tool Visualization
      const toolGeo = new THREE.CylinderGeometry(0.1, 0.1, 5, 16);
      const toolMat = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.5 });
      const tool = new THREE.Mesh(toolGeo, toolMat);
      tool.position.set(0, 2.5, 0);
      sceneRef.current.add(tool);
      toolRef.current = tool;
    } else {
      if (toolRef.current) {
        sceneRef.current.remove(toolRef.current);
        toolRef.current = null;
      }
    }

    let material: THREE.Material;

    if (simMode) {
      material = new THREE.ShaderMaterial({
        uniforms: {
          toolVector: { value: new THREE.Vector3(0, 1, 0) }
        },
        vertexShader: reachabilityVertexShader,
        fragmentShader: reachabilityFragmentShader,
      });
    } else {
      material = new THREE.MeshPhysicalMaterial({
        color: 0x2c3e50,
        metalness: 0.9,
        roughness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        reflectivity: 1.0,
        envMapIntensity: 1.0,
      });
    }

    const mesh = new THREE.Mesh(geometry, material);

    meshRef.current = mesh;
    sceneRef.current.add(mesh);
  }, [geometry, simMode]);

  useEffect(() => {
    if (!sceneRef.current || !gizmoRef.current) return;
    const gizmo = gizmoRef.current;
    const scene = sceneRef.current;

    if (ghostMeshRef.current) {
      scene.remove(ghostMeshRef.current);
      ghostMeshRef.current = null;
    }

    const isContainer = (type: string) => ['Group', 'Union', 'Subtract', 'Intersect'].includes(type);

    if (selectedNode && !isContainer(selectedNode.type)) {
      const { position, rotation, scale } = selectedNode.transform;

      let geo;
      if (selectedNode.type === 'Box') {
        geo = new THREE.BoxGeometry(selectedNode.params.width || 1, selectedNode.params.height || 1, selectedNode.params.depth || 1);
      } else if (selectedNode.type === 'Sphere') {
        geo = new THREE.SphereGeometry(selectedNode.params.radius || 1, 16, 16);
      } else {
        geo = new THREE.CylinderGeometry(selectedNode.params.radiusHigh || 1, selectedNode.params.radiusLow || 1, selectedNode.params.height || 2, 16);
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
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1a1a2e',
          color: '#ff6b6b',
          padding: '20px',
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div>
          <h2 style={{ marginBottom: '10px' }}>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
    />
  );
}
