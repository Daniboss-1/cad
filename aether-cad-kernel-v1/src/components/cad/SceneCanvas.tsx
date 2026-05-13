"use client";

import { useEffect, useRef, useState } from "react";

export function SceneCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webgpuSupported, setWebgpuSupported] = useState<boolean | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (typeof navigator === "undefined" || !("gpu" in navigator)) {
      setWebgpuSupported(false);
      return;
    }

    let frameId = 0;
    let renderer: any;
    let scene: any;
    let camera: any;
    let mesh: any;
    let resizeObserver: ResizeObserver | null = null;
    let running = true;

    const initScene = async () => {
      const THREE = await import("three");
      const { WebGPURenderer } = await import("three/examples/jsm/renderers/WebGPURenderer.js");

      const canvas = canvasRef.current!;
      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(new THREE.Color("#020202"), 0.011);

      camera = new THREE.PerspectiveCamera(34, canvas.clientWidth / canvas.clientHeight, 0.1, 440);
      camera.position.set(28, 18, 36);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.46);
      scene.add(ambientLight);
      const keyLight = new THREE.DirectionalLight(0xebf3ff, 0.8);
      keyLight.position.set(14, 26, 18);
      scene.add(keyLight);
      const fillLight = new THREE.PointLight(0x65fff5, 1.1, 130);
      fillLight.position.set(-18, 22, 16);
      scene.add(fillLight);

      const grid = new THREE.GridHelper(160, 72, 0x144f78, 0x0b1423);
      (grid.material as THREE.Material).opacity = 0.34;
      (grid.material as THREE.Material).transparent = true;
      scene.add(grid);

      const envGeo = new THREE.SphereGeometry(72, 40, 32);
      const envMat = new THREE.MeshStandardMaterial({
        color: 0x0c1119,
        roughness: 0.96,
        metalness: 0.08,
        side: THREE.BackSide,
      });
      scene.add(new THREE.Mesh(envGeo, envMat));

      const bodyGeo = new THREE.CylinderGeometry(4.3, 4.3, 11.4, 82, 2, true);
      const bodyMat = new THREE.MeshPhysicalMaterial({
        color: 0xdfe5ff,
        metalness: 1.0,
        roughness: 0.18,
        clearcoat: 0.26,
        clearcoatRoughness: 0.06,
        reflectivity: 0.98,
        sheen: 0.34,
        sheenColor: new THREE.Color(0x8df2ff),
        emissive: new THREE.Color(0x081126),
        emissiveIntensity: 0.22,
        ior: 1.45,
      });
      mesh = new THREE.Mesh(bodyGeo, bodyMat);
      mesh.position.y = 5.8;
      scene.add(mesh);

      renderer = new WebGPURenderer({
        canvas,
        antialias: true,
        alpha: false,
      });
      renderer.setClearColor("#020202", 1);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

      const resize = () => {
        if (!canvasRef.current) return;
        const width = canvasRef.current.clientWidth;
        const height = canvasRef.current.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
      };

      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(canvas);
      resize();

      const clock = new THREE.Clock();
      const animate = () => {
        if (!running) return;
        const delta = clock.getDelta();
        mesh.rotation.y += delta * 0.18;
        mesh.rotation.x = Math.sin(clock.elapsedTime * 0.18) * 0.04;
        renderer.render(scene, camera);
        frameId = requestAnimationFrame(animate);
      };
      animate();
      setWebgpuSupported(true);
    };

    initScene().catch(() => setWebgpuSupported(false));

    return () => {
      running = false;
      cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
      renderer?.dispose?.();
      scene?.dispose?.();
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden rounded-[2rem] bg-[#020202]">
      <canvas ref={canvasRef} className="h-full w-full" />
      {webgpuSupported === false ? (
        <div className="absolute inset-0 flex items-center justify-center rounded-[2rem] bg-black/90 px-6 text-center text-sm text-slate-200">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.35em] text-cyan-300/70">WebGPU only</p>
            <p>Open this workspace in a browser that supports WebGPU for the full render experience.</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
