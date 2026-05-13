# Aether CAD: Digital Archaeology

Design as an excavation of form. Aether CAD is a next-generation parametric CAD application built with Next.js, Three.js, and Manifold-3D, focused on the "Digital Archaeology" philosophy.

## Vision: Digital Archaeology
In Aether CAD, every design is a temporal sequence of operations—a stratigraphy of form. We don't just build models; we excavate them from the digital void. The History Tree is your "Stratigraphy," where every layer (operation) can be tuned, reordered, or suppressed to reveal the underlying architecture.

## 4-Phase Roadmap

### Phase 1: Core Modeling
- **Basic Primitives**: Box, Sphere, Cylinder, and Torus with high-fidelity mesh generation.
- **Parametric Kernel**: Robust CSG operations (Union, Subtract, Intersect) powered by Manifold-3D.
- **Kernel Extensions**: Implementation of 3D Fillets and advanced smoothing algorithms.
- **WASM Lifecycle**: Strict memory management and optimized reconstruction loops.

### Phase 2: Archaeology Engine
- **Stratigraphy (History Tree)**: A non-destructive timeline of operations.
- **Digital Archaeology Pipeline**: Enhanced PDF-to-CAD extraction with confidence heatmaps and audit trails.
- **Vector Reconstruction**: Advanced OCR and vectorization of industrial blueprints.
- **Command-K Nexus**: A spotlight-style search shell for rapid command execution.

### Phase 3: Manufacturing Intelligence
- **Geometric Constraint Solver (Sim)**: Simulation-based validation of geometric integrity.
- **Supply-Chain Sentinel**: Integrated BOM (Bill of Materials) with cost estimation and lead-time tracking.
- **PBR Visualization**: Industrial-grade physically based rendering for manufacturing review.
- **Audit Trails**: Detailed logs of every geometric modification for compliance.

### Phase 4: Polish & Launch
- **Refined UX**: Modern Glassmorphism UI with professional CAD ergonomics.
- **STEP Export**: Integration with OpenCASCADE workers for industry-standard exchange.
- **Documentation**: Comprehensive technical manuals and API documentation.
- **Performance Tuning**: Final optimizations for large-scale assembly rendering.

---

## Technical Stack
- **Framework**: Next.js
- **Engine**: Three.js (Rendering) & Manifold-3D (CSG Kernel)
- **State**: Zustand
- **Styling**: Modern Glassmorphism with Tailwind & Radix UI
- **Intelligence**: Tesseract.js & PDF.js for blueprint analysis
