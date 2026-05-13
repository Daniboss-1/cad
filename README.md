# Aether CAD: Digital Archaeology

Design as an excavation of form: **Aether CAD** is a next-generation parametric CAD application built with Next.js, Three.js, and Manifold-3D, based on the "Digital Archaeology" philosophy.

---

## Table of Contents
- [Vision](#vision-digital-archaeology)
- [Roadmap](#4-phase-roadmap)
- [Technical Stack](#technical-stack)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

---

## Vision: Digital Archaeology
In Aether CAD, every design is a temporal sequence of operations—a stratigraphy of form. We don't just build models; we excavate them from the digital void. The History Tree is your "Stratigraphy Log," documenting every transformation and operation.

## 4-Phase Roadmap
### Phase 1: Core Modeling
- **Basic Primitives**: Box, Sphere, Cylinder, Torus (high-fidelity mesh generation)
- **Parametric Kernel**: Robust CSG operations (Union, Subtract, Intersect) powered by Manifold-3D
- **Kernel Extensions**: 3D Fillets, advanced smoothing algorithms
- **WASM Lifecycle**: Strict memory management, optimized reconstruction loops

### Phase 2: Archaeology Engine
- **Stratigraphy (History Tree)**: Non-destructive timeline of operations
- **Digital Archaeology Pipeline**: PDF-to-CAD extraction with confidence heatmaps and audit trails
- **Vector Reconstruction**: Advanced OCR and vectorization of industrial blueprints
- **Command-K Nexus**: Spotlight-style search shell for rapid actions

### Phase 3: Manufacturing Intelligence
- **Constraint Solver**: Simulation-based validation of geometry
- **Supply-Chain Sentinel**: Integrated BOM, cost estimation, lead-time tracking
- **PBR Visualization**: Industrial-grade rendering
- **Audit Trails**: Full geometric mod history for compliance

### Phase 4: Polish & Launch
- **UX Polish**: Modern UI, CAD ergonomics
- **STEP Export**: Integration with OpenCASCADE
- **Documentation**: User & API docs
- **Performance Tuning**: Large assembly optimization

---

## Technical Stack
- **Framework:** Next.js
- **3D Engine:** Three.js (Rendering) & Manifold-3D (CSG Kernel)
- **State:** Zustand
- **Styling:** Tailwind CSS & Radix UI (Glassmorphism)
- **AI/Automation:** Tesseract.js & PDF.js for blueprint analysis

---

## Getting Started

1. **Clone the repository:**
    ```sh
    git clone https://github.com/Daniboss-1/cad.git
    cd cad
    ```
2. **Install dependencies:**
    ```sh
    npm install
    # or
    yarn install
    ```
3. **Run in development:**
    ```sh
    npm run dev
    # or
    yarn dev
    ```

## Usage
- Open `http://localhost:3000` in your browser after starting the dev server.
- Explore available modeling primitives and the history tree.
- Check [`TODO.md`](./TODO.md) for upcoming features and planned tasks.

## Contributing
- Fork the repo and create feature branches from `main`.
- Follow Feature-Sliced Design (FSD) structure—see architecture in codebase.
- Run `npm run lint` and `npm run format` before submitting a PR.
- All contributions and feedback welcome! Open an issue or PR for discussion.

## License
Add a license here if you haven’t yet (e.g., MIT, Apache-2.0, GPL-3.0); update this section after choosing a license.

## Community & Support
- File issues for bugs, discussions, and feature requests.
- For roadmap/tasks, see [`TODO.md`](./TODO.md).

---

*Project maintained by [Daniboss-1](https://github.com/Daniboss-1).*