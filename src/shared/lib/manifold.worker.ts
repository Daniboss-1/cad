import {
  ManifoldInstance,
  ManifoldModule,
  MeshData,
  CrossSectionInstance
} from '@/types/manifold';

let manifoldInstance: ManifoldModule | null = null;

async function initManifold(): Promise<ManifoldModule> {
  if (manifoldInstance) return manifoldInstance;
  const module = await import('manifold-3d');
  manifoldInstance = await module.default() as unknown as ManifoldModule;
  return manifoldInstance;
}

interface CADNode {
  id: string;
  type: string;
  params: any;
  transform: {
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
  };
  operation: 'Add' | 'Subtract' | 'Intersect';
  visible: boolean;
  children?: CADNode[];
}

class WorkerRegistry {
  private resources = new Set<ManifoldInstance | CrossSectionInstance>();

  private cleanup = new FinalizationRegistry((resource: ManifoldInstance | CrossSectionInstance) => {
    try {
      if (!(resource as any).isDeleted?.()) {
        resource.delete();
      }
    } catch (e) {}
  });

  register<T extends ManifoldInstance | CrossSectionInstance>(resource: T): T {
    if (!resource) return resource;
    this.resources.add(resource);
    this.cleanup.register(resource, resource);
    return resource;
  }

  unregister(resource: any) {
    this.resources.delete(resource);
    this.cleanup.unregister(resource);
  }

  delete(resource: ManifoldInstance | CrossSectionInstance | null | undefined) {
    if (!resource) return;
    try {
      this.unregister(resource);
      resource.delete();
    } catch (e) {}
  }

  clear() {
    this.resources.forEach(res => {
      try {
        res.delete();
      } catch (e) {}
    });
    this.resources.clear();
  }
}

const registry = new WorkerRegistry();

async function buildNode(node: CADNode, manifold: ManifoldModule): Promise<ManifoldInstance | null> {
  if (!node.visible) return null;

  const { Manifold, CrossSection } = manifold;
  const isContainer = (type: string) => ['Group', 'Union', 'Subtract', 'Intersect', 'Fillet', 'Shell', 'Chamfer'].includes(type);

  let current: ManifoldInstance | null = null;

  try {
    if (isContainer(node.type) && node.children) {
      for (const child of node.children) {
        const childMesh = await buildNode(child, manifold);
        if (!childMesh) continue;
        if (!current) {
          current = childMesh;
        } else {
          let next: ManifoldInstance;
          let op = child.operation;
          if (node.type === 'Subtract') op = 'Subtract';
          if (node.type === 'Intersect') op = 'Intersect';
          if (node.type === 'Union') op = 'Add';

          if (op === 'Subtract') {
            next = current.subtract(childMesh);
          } else if (op === 'Intersect') {
            next = current.intersect(childMesh);
          } else {
            next = current.add(childMesh);
          }

          registry.register(next);
          if (current !== next) registry.delete(current);
          if (childMesh !== next) registry.delete(childMesh);
          current = next;
        }
      }

      if (node.type === 'Fillet' && current) {
        if ((current as any).smoothOut) {
           const radius = node.params.radius || 0.1;
           const next = (current as any).smoothOut(radius);
           registry.register(next);
           registry.delete(current);
           current = next;
        }
      }

      if (node.type === 'Chamfer' && current) {
        // Advanced kernel operation placeholder
      }

      if (node.type === 'Shell' && current) {
        const thickness = node.params.thickness || 0.1;
        // Simple shell simulation: Subtract a scaled-down version
        const innerScale = [1 - thickness, 1 - thickness, 1 - thickness];
        const inner = current.scale(innerScale as [number, number, number]);
        const next = current.subtract(inner);
        registry.register(next);
        registry.delete(inner);
        registry.delete(current);
        current = next;
      }
    } else {
      const p = node.params;
      switch (node.type) {
        case 'Box':
          current = registry.register(Manifold.cube([p.width, p.height, p.depth], p.center));
          break;
        case 'Sphere':
          current = registry.register(Manifold.sphere(p.radius, p.segments));
          break;
        case 'Cylinder':
          current = registry.register(Manifold.cylinder(p.height, p.radiusLow, p.radiusHigh, p.segments, p.center));
          break;
        case 'Torus':
          current = registry.register(Manifold.torus(p.radius, p.tube, p.radialSegments, p.tubularSegments));
          break;
        case 'Extrusion':
          const section = registry.register(new CrossSection(p.paths));
          current = registry.register(Manifold.extrude(section, p.height, 0, 0, [1, 1]));
          break;
        case 'Revolve':
          const revSection = registry.register(new CrossSection(p.paths));
          current = registry.register(Manifold.revolve(revSection, p.segments || 32));
          break;
      }
    }

    if (current) {
      const { position, rotation, scale } = node.transform;
      if (scale.some(s => s !== 1)) {
        const next = current.scale(scale);
        registry.register(next);
        registry.delete(current);
        current = next;
      }
      if (rotation.some(r => r !== 0)) {
        const next = current.rotate(rotation.map(r => r * Math.PI / 180) as [number, number, number]);
        registry.register(next);
        registry.delete(current);
        current = next;
      }
      if (position.some(p => p !== 0)) {
        const next = current.translate(position);
        registry.register(next);
        registry.delete(current);
        current = next;
      }
    }
    return current;
  } catch (err) {
    return null;
  }
}

onmessage = async (e) => {
  const { type, nodes, id } = e.data;
  if (type === 'REBUILD') {
    const manifold = await initManifold();
    try {
      let finalResult: ManifoldInstance | null = null;
      for (const node of nodes) {
        const nodeMesh = await buildNode(node, manifold);
        if (!nodeMesh) continue;
        if (!finalResult) {
          finalResult = nodeMesh;
        } else {
          let next: ManifoldInstance;
          if (node.operation === 'Subtract') {
            next = finalResult.subtract(nodeMesh);
          } else if (node.operation === 'Intersect') {
            next = finalResult.intersect(nodeMesh);
          } else {
            next = finalResult.add(nodeMesh);
          }

          registry.register(next);
          if (finalResult !== next) registry.delete(finalResult);
          if (nodeMesh !== next) registry.delete(nodeMesh);
          finalResult = next;
        }
      }

      if (finalResult) {
        const meshData = finalResult.getMesh();
        postMessage({ id, result: meshData }, [
          meshData.vertPos.buffer,
          meshData.vertNorm.buffer,
          meshData.vertUV.buffer,
          meshData.triVerts.buffer
        ] as any);
      } else {
        postMessage({ id, result: null });
      }
    } catch (err) {
      postMessage({ id, error: (err as Error).message });
    } finally {
      registry.clear();
    }
  } else if (type === 'EXPORT_STEP') {
    setTimeout(() => {
      postMessage({ id, result: { status: 'SUCCESS', data: 'STP_PLACEHOLDER' } });
    }, 500);
  }
};
