# Aether CAD: Digital Archaeology

Design as an excavation of form. Aether CAD is a next-generation parametric CAD application built with Next.js, Three.js, and Manifold-3D, focused on the "Digital Archaeology" philosophy.

## Vision: Digital Archaeology
In Aether CAD, every design is a temporal sequence of operations—a stratigraphy of form. We don't just build models; we excavate them from the digital void. The History Tree is your "Stratigraphy," where every layer (operation) can be tuned, reordered, or suppressed to reveal the underlying architecture.

## Roadmap

### Phase 0: Foundations (Current)
- **Basic Primitives**: Box, Sphere, Cylinder, and Torus.
- **Stratigraphy (History Tree)**: A linear list of operations that defines the final form.
- **Command-K Nexus**: A spotlight-style search shell for quickly adding primitives.
- **Parametric Controls**: Real-time adjustment of primitive dimensions and segments.

### Phase 1: Boolean Mastery
- **Recursive CSG**: Robust boolean operations (Union, Subtract, Intersect) with a recursive builder.
- **Lifecycle Management**: Strict WASM memory management to ensure stability.
- **Advanced Transforms**: Positioning and rotation for every node in the stratigraphy.
- **Visibility States**: Toggle individual layers to see intermediate excavation stages.

### Phase 2: Materiality
- **PBR Rendering**: High-quality physically based rendering for industrial visualization.
- **Archaeological Shaders**: Custom shaders that highlight the "excavation" process and form intersections.
- **Export/Import**: STL and GLTF support for 3D printing and web integration.

---

## Technical Stack
- **Framework**: Next.js
- **Engine**: Three.js (Rendering) & Manifold-3D (CSG Kernal)
- **State**: Zustand
- **Styling**: Inline CSS with "Nexus" aesthetic
