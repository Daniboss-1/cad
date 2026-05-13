# Aether CAD - Demo & Example Projects

This document provides example implementations and workflows using Aether CAD.

---

## Getting Started with Your First Model

### Example 1: Creating a Simple Box

```typescript
// src/app/examples/simple-box.tsx
'use client'

import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function SimpleBoxDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // Setup scene
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current })
    renderer.setSize(window.innerWidth, window.innerHeight)
    camera.position.z = 5

    // Create box geometry
    const geometry = new THREE.BoxGeometry(2, 2, 2)
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 })
    const box = new THREE.Mesh(geometry, material)
    scene.add(box)

    // Add lighting
    const light = new THREE.DirectionalLight(0xffffff, 1)
    light.position.set(5, 10, 5)
    scene.add(light)

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      box.rotation.x += 0.01
      box.rotation.y += 0.01
      renderer.render(scene, camera)
    }
    animate()

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return <canvas ref={canvasRef} className="w-full h-screen" />
}
```

---

## Example 2: CSG Operations

### Creating a Complex Shape with Union

```typescript
// src/lib/examples/csg-union.ts
import { Manifold } from 'manifold-3d'

export async function createComplexShape() {
  // Create base box
  const boxProps = {
    size: [4, 4, 4],
  }
  const box = new Manifold({
    ...boxProps,
  })

  // Create sphere
  const sphereProps = {
    radius: 2,
    circularSegments: 64,
  }
  const sphere = new Manifold({
    ...sphereProps,
  })

  // Union: Combine box and sphere
  const combined = box.union(sphere)

  // Get mesh for Three.js
  const mesh = combined.getMesh()
  return mesh
}
```

### Subtracting to Create a Hole

```typescript
// src/lib/examples/csg-subtract.ts
export async function createHoledBox() {
  // Create main box
  const box = new Manifold({
    size: [4, 4, 4],
  })

  // Create cylinder for hole
  const cylinder = new Manifold({
    radius: 1,
    height: 4,
    circularSegments: 32,
  })

  // Subtract cylinder from box
  const holed = box.subtract(cylinder)

  return holed.getMesh()
}
```

---

## Example 3: Using Zustand Store

```typescript
// src/store/examples/model-demo.ts
import { create } from 'zustand'

interface Model {
  id: string
  name: string
  geometry: THREE.BufferGeometry
}

interface ModelStore {
  models: Model[]
  currentModelId: string | null
  addModel: (model: Model) => void
  removeModel: (id: string) => void
  setCurrentModel: (id: string) => void
  getModel: (id: string) => Model | undefined
}

export const useModelStore = create<ModelStore>((set, get) => ({
  models: [],
  currentModelId: null,

  addModel: (model) =>
    set((state) => ({
      models: [...state.models, model],
      currentModelId: model.id,
    })),

  removeModel: (id) =>
    set((state) => ({
      models: state.models.filter((m) => m.id !== id),
      currentModelId:
        state.currentModelId === id ? null : state.currentModelId,
    })),

  setCurrentModel: (id) =>
    set({
      currentModelId: id,
    }),

  getModel: (id) => {
    return get().models.find((m) => m.id === id)
  },
}))
```

---

## Example 4: History/Undo-Redo

```typescript
// src/store/examples/history-demo.ts
import { create } from 'zustand'

interface HistoryEntry {
  id: string
  operation: string
  timestamp: Date
  data: unknown
}

interface HistoryStore {
  entries: HistoryEntry[]
  currentIndex: number
  addEntry: (entry: HistoryEntry) => void
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
}

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  entries: [],
  currentIndex: -1,

  addEntry: (entry) =>
    set((state) => ({
      entries: [...state.entries.slice(0, state.currentIndex + 1), entry],
      currentIndex: state.currentIndex + 1,
    })),

  undo: () =>
    set((state) => ({
      currentIndex: Math.max(0, state.currentIndex - 1),
    })),

  redo: () =>
    set((state) => ({
      currentIndex: Math.min(
        state.entries.length - 1,
        state.currentIndex + 1
      ),
    })),

  canUndo: () => get().currentIndex > 0,
  canRedo: () => get().currentIndex < get().entries.length - 1,
}))
```

---

## Example 5: Testing CSG Operations

```typescript
// tests/unit/csg.test.ts
import { createComplexShape, createHoledBox } from '@/lib/examples/csg-subtract'

describe('CSG Operations Examples', () => {
  test('should create complex union shape', async () => {
    const mesh = await createComplexShape()
    expect(mesh).toBeDefined()
    expect(mesh.vertices).toBeDefined()
    expect(mesh.triangles).toBeDefined()
  })

  test('should create holed box', async () => {
    const mesh = await createHoledBox()
    expect(mesh).toBeDefined()
    expect(mesh.vertices.length).toBeGreaterThan(0)
  })

  test('should maintain valid geometry', async () => {
    const mesh = await createComplexShape()
    expect(mesh.triangles.length % 3).toBe(0) // Valid triangles
  })
})
```

---

## Example 6: Blueprint Parsing

```typescript
// src/services/examples/blueprint-demo.ts
import Tesseract from 'tesseract.js'

export async function parseBlueprintImage(imageUrl: string) {
  try {
    const result = await Tesseract.recognize(
      imageUrl,
      'eng'
    )

    return {
      text: result.data.text,
      confidence: result.data.confidence,
      lines: result.data.lines,
    }
  } catch (error) {
    console.error('Blueprint parsing failed:', error)
    throw error
  }
}

// Usage in component
export async function analyzeBlueprintComponent(file: File) {
  const url = URL.createObjectURL(file)
  const analysis = await parseBlueprintImage(url)
  URL.revokeObjectURL(url)
  return analysis
}
```

---

## Example 7: React Component Integration

```typescript
// src/components/examples/ModelViewer.tsx
'use client'

import React, { useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera, OrbitControls } from '@react-three/drei'
import { useModelStore } from '@/store/modelStore'

export function ModelViewer() {
  const { currentModelId, getModel } = useModelStore()
  const model = currentModelId ? getModel(currentModelId) : null

  return (
    <Canvas>
      <PerspectiveCamera position={[0, 0, 10]} makeDefault />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} />
      <OrbitControls />

      {model && (
        <mesh geometry={model.geometry}>
          <meshStandardMaterial color="#ff0000" />
        </mesh>
      )}
    </Canvas>
  )
}
```

---

## Example 8: Integration Test

```typescript
// tests/integration/workflow.test.ts
import { renderHook, act } from '@testing-library/react'
import { useModelStore } from '@/store/modelStore'
import { useHistoryStore } from '@/store/historyStore'

describe('Complete Workflow', () => {
  test('should create model and track history', () => {
    const { result: modelResult } = renderHook(() => useModelStore())
    const { result: historyResult } = renderHook(() => useHistoryStore())

    act(() => {
      const newModel = {
        id: '1',
        name: 'Box 1',
        geometry: new THREE.BoxGeometry(),
      }
      modelResult.current.addModel(newModel)
      historyResult.current.addEntry({
        id: '1',
        operation: 'create',
        timestamp: new Date(),
        data: newModel,
      })
    })

    expect(modelResult.current.models).toHaveLength(1)
    expect(historyResult.current.entries).toHaveLength(1)
    expect(historyResult.current.canUndo()).toBe(true)
  })
})
```

---

## Running the Examples

```bash
# Start dev server
npm run dev

# Visit examples at:
# http://localhost:3000/examples/simple-box
# http://localhost:3000/examples/csg-operations
# http://localhost:3000/examples/blueprint-parser

# Run example tests
npm test -- examples
```

---

## Next Steps

1. **Expand on Phase 1** - Add more primitives
2. **Build UI** - Create model editor interface
3. **Add persistence** - Save/load models
4. **Optimize rendering** - Add LOD system
5. **Export features** - STEP, STL export

---

## Learning Resources

- [Three.js Getting Started](https://threejs.org/docs/index.html)
- [Manifold-3D Documentation](https://manifold3d.org)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

---

**Happy building! 🚀**
