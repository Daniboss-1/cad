# Aether CAD: The 120-Task Master Manifest (2026 Vision)

## Summary of Current State
- **Framework**: Next.js 14 (App Router)
- **Architecture**: Feature-Sliced Design (FSD)
- **Geometry Kernel**: Manifold-3D (WASM) with Three.js visualization.
- **State**: Zustand-based Stratigraphy (History Tree).
- **UI**: Custom "Nexus" aesthetic (needs modernization with shadcn/ui).

---

## Phase 0.5: Infrastructure & UI Modernization (Tasks 1-15)
- [ ] **Task 1**: [root] Initialize **shadcn/ui** and Radix UI. | *Priority: P0* | Success: `components.json` configured; button component works.
- [ ] **Task 2**: [src/shared/lib/manifold] Implement **Manifold-3D SharedWorker** for background geometry processing. | *Priority: P0* | Success: Complex CSG doesn't block UI thread.
- [ ] **Task 3**: [src/shared/ui] Create **Nexus Theme Provider** with Dark/Light/High-Contrast modes. | *Priority: P1* | Success: Theme persists and applies to all components.
- [ ] **Task 4**: [src/shared/lib/manifold] Implement **ManifoldRegistry** with `FinalizationRegistry` for auto-memory cleanup. | *Priority: P0* | Success: No WASM memory growth over 1000 operations.
- [ ] **Task 5**: [src/shared/ui] Build **Command-K Nexus** v2 using Command (cmdk) library. | *Priority: P1* | Success: Fuzzy search and keyboard navigation.
- [ ] **Task 6**: [src/widgets/sidebar] Refactor **Stratigraphy Tree** using `@dnd-kit` for drag-and-drop reordering. | *Priority: P1* | Success: Can reorder operations with visual feedback.
- [ ] **Task 7**: [src/shared/lib/cad] Add **Z-Up/Y-Up coordinate system toggle**. | *Priority: P2* | Success: Viewport and math adjust to user preference.
- [ ] **Task 8**: [src/shared/api] Setup **Next-Safe-Action** for type-safe server actions. | *Priority: P1* | Success: API calls are typed and validated.
- [ ] **Task 9**: [src/shared/ui] Implement **Viewport Toolbar** (Zoom-to-fit, Wireframe, X-Ray). | *Priority: P1* | Success: One-click view adjustments.
- [ ] **Task 10**: [src/shared/lib/store] Add **Undo/Redo logic** using Zustand middleware. | *Priority: P0* | Success: `Ctrl+Z` reverts last 50 actions.
- [ ] **Task 11**: [src/shared/ui] Build **Parametric Slider** v2 with value scrubbing and unit conversion. | *Priority: P1* | Success: Dragging label changes value; supports `mm`, `in`, `cm`.
- [ ] **Task 12**: [src/shared/lib/math] Implement **Matrix4 serialization** for cross-thread transform passing. | *Priority: P1* | Success: Transforms match exactly between worker and UI.
- [ ] **Task 13**: [src/features/auth] Basic **Auth.js** integration (GitHub/Email). | *Priority: P2* | Success: Users can save models to their profile.
- [ ] **Task 14**: [src/shared/ui] Implement **Toaster** for long-running kernel notifications. | *Priority: P2* | Success: User notified when "Excavation Complete".
- [ ] **Task 15**: [src/shared/lib/cad] Implement **BoundingBox preview** for fast primitive dragging. | *Priority: P1* | Success: Shows wire-box while moving, renders manifold on drop.

## Phase 1: Boolean Mastery & Advanced Kernels (Tasks 16-30)
- [ ] **Task 16**: [src/shared/lib/cad] Add **Extrude** operation (Path-based). | *Priority: P0* | Success: Polygon + Depth = Solid.
- [ ] **Task 17**: [src/shared/lib/cad] Add **Revolve** operation. | *Priority: P1* | Success: 2D profile rotated around axis.
- [ ] **Task 18**: [src/shared/lib/cad] Add **Fillet** (Edge-based) kernel bridge. | *Priority: P0* | Success: Smooths intersections of two solids.
- [ ] **Task 19**: [src/shared/lib/cad] Add **Chamfer** operation. | *Priority: P1* | Success: Beveled edges on intersections.
- [ ] **Task 20**: [src/shared/lib/cad] Implement **Shell/Hollow** with wall thickness param. | *Priority: P1* | Success: Inward/Outward offsets.
- [ ] **Task 21**: [src/entities/geometry] Implement **Edge Selection** logic in Three.js Viewport. | *Priority: P1* | Success: Clicking edge highlights it for Fillet/Chamfer.
- [ ] **Task 22**: [src/shared/lib/cad] Add **Boolean Intersection** UI/Logic. | *Priority: P0* | Success: Keeps only shared volume.
- [ ] **Task 23**: [src/shared/lib/cad] Implement **Circular/Linear Patterns**. | *Priority: P1* | Success: Array of 10 boxes generated from 1 node.
- [ ] **Task 24**: [src/shared/lib/cad] Add **Draft Angle** operation for injection molding. | *Priority: P2* | Success: Faces tapered by specified degrees.
- [ ] **Task 25**: [src/features/export] Implement **STL Export** with vertex normalization. | *Priority: P1* | Success: Resulting STL is watertight.
- [ ] **Task 26**: [src/features/export] Implement **GLTF/GLB Export** with PBR material metadata. | *Priority: P1* | Success: Loads correctly in Blender/Three.js.
- [ ] **Task 27**: [src/shared/lib/cad] Add **Mirror** operation across planes (XY, YZ, ZX). | *Priority: P1* | Success: Reflects geometry across center.
- [ ] **Task 28**: [src/shared/lib/cad] Implement **Offset Face** kernel command. | *Priority: P2* | Success: Moves specific faces by distance.
- [ ] **Task 29**: [src/features/import] Implement **OBJ-to-Manifold** mesh healer. | *Priority: P2* | Success: Non-manifold OBJ becomes valid solid.
- [ ] **Task 30**: [src/shared/lib/cad] Add **Split Solid** (Plane-based). | *Priority: P2* | Success: One node becomes two distinct parts.

## Phase 2: Neural Digital Archaeology (Tasks 31-45)
- [ ] **Task 31**: [src/features/vlm] Set up **Vision-Language Model (VLM) Pipeline** (Vercel AI SDK). | *Priority: P0* | Success: Image sent to GPT-4o-vision; returns structured CAD ops.
- [ ] **Task 32**: [src/features/vlm] Implement **PNG-to-Primitive translator**. | *Priority: P0* | Success: Sketch of a bracket becomes a Box + Cylinders.
- [ ] **Task 33**: [src/features/vlm] Implement **PDF Blueprint parsing** (Scale Detection). | *Priority: P1* | Success: Detects "Scale 1:10" and applies to model.
- [ ] **Task 34**: [src/shared/ui] Create **Confidence Heatmap Overlay** for AI suggestions. | *Priority: P1* | Success: Low-confidence regions highlight in yellow/red.
- [ ] **Task 35**: [src/features/vlm] Implement **Dimension Extraction** from text annotations. | *Priority: P1* | Success: "5mm" in image becomes `radius: 2.5` in CAD.
- [ ] **Task 36**: [src/widgets/reasoning] Build the **XAI Reasoning Panel**. | *Priority: P1* | Success: AI explains why it chose a Fillet over a Chamfer.
- [ ] **Task 37**: [src/features/vlm] Implement **Visual Diffing** (AI Suggestion vs Reality). | *Priority: P2* | Success: Ghosted overlay shows proposed changes.
- [ ] **Task 38**: [src/features/vlm] Add **Multi-sketch Fusion** (Top/Side/Front photos to 3D). | *Priority: P1* | Success: 3 images yield 1 coherent model.
- [ ] **Task 39**: [src/features/vlm] Implement **Neural-Parametric Translator** (Weights → Params). | *Priority: P2* | Success: AI adjusts sliders to match "Look and Feel".
- [ ] **Task 40**: [src/features/vlm] Implement **Style Transfer** (e.g., "Make it Organic"). | *Priority: P2* | Success: Applies fillets/noise based on style.
- [ ] **Task 41**: [src/shared/lib/vision] Implement **Edge Detection pre-processor** (Canny/Sobel). | *Priority: P1* | Success: Highlights contours before VLM inference.
- [ ] **Task 42**: [src/features/vlm] Add **Part Recognition** (Detects standard bolts/nuts in image). | *Priority: P1* | Success: Maps image region to Library part.
- [ ] **Task 43**: [src/widgets/vlm] Implement **Refinement Chat** (AI-guided modeling). | *Priority: P1* | Success: "The hole is too big" → AI updates param.
- [ ] **Task 44**: [src/features/vlm] Implement **Archaeological Stratigraphy recovery**. | *Priority: P2* | Success: Infers the order of operations from a final mesh.
- [ ] **Task 45**: [src/features/vlm] Add **Material Inference** (AI detects Metal/Plastic from texture). | *Priority: P2* | Success: Sets default metadata based on image.

## Phase 3: Supply-Chain & GMS Twin (Tasks 46-65)
- [ ] **Task 46**: [src/shared/api/octopart] Integrate **Octopart/Digi-Key API**. | *Priority: P1* | Success: Live pricing and stock for Part Numbers.
- [ ] **Task 47**: [src/widgets/bom] Build **ActiveBOM Panel** with multi-currency support. | *Priority: P1* | Success: BOM updates instantly as parts change.
- [ ] **Task 48**: [src/shared/ui] Build the **"Vibe Light" status component**. | *Priority: P1* | Success: Green/Yellow/Red status based on lead-time.
- [ ] **Task 49**: [src/features/simulation] Implement **Machining Time Estimator**. | *Priority: P1* | Success: Estimates CNC time based on volume removed.
- [ ] **Task 50**: [src/features/simulation] Build **Cost-per-Second Ticker**. | *Priority: P2* | Success: Real-time USD counter as you design.
- [ ] **Task 51**: [src/shared/shaders] Implement **3-Axis Tool Accessibility Shader**. | *Priority: P1* | Success: Red highlights on unreachable faces.
- [ ] **Task 52**: [src/shared/shaders] Implement **5-Axis Undercut Detection Shader**. | *Priority: P2* | Success: Blue highlights on undercut regions.
- [ ] **Task 53**: [src/features/simulation] Implement **Wall Thickness Checker** (Manifold Ray-casting). | *Priority: P1* | Success: Flags regions < 1mm for 3D printing.
- [ ] **Task 54**: [src/entities/geometry] Build the **"Ghost Factory" overlay**. | *Priority: P2* | Success: Visualizes the machining stock vs final part.
- [ ] **Task 55**: [src/features/simulation] Implement **SLA/SLS Support Visualizer**. | *Priority: P2* | Success: Shows where support structures will grow.
- [ ] **Task 56**: [src/features/simulation] Add **Parting Line Detection** (Injection Molding). | *Priority: P2* | Success: Draws line where mold split occurs.
- [ ] **Task 57**: [src/widgets/bom] Add **Lead-Time Heatmap** for assembly. | *Priority: P2* | Success: Highlights long-lead items in the 3D view.
- [ ] **Task 58**: [src/features/simulation] Implement **Real-time Toolpath Simulation** (G-Code lite). | *Priority: P2* | Success: Animates a tool removing material.
- [ ] **Task 59**: [src/shared/api/xometry] Integrate **Xometry/Protolabs Quote API**. | *Priority: P1* | Success: One-click real-world manufacturing quotes.
- [ ] **Task 60**: [src/features/simulation] Add **Material Waste Factor** calculation. | *Priority: P2* | Success: Displays ratio of stock volume to final volume.
- [ ] **Task 61**: [src/widgets/manufacturing] Create **DFM Checklist widget** (Design for Manufacturing). | *Priority: P1* | Success: "Warning: Tight tolerances increase cost".
- [ ] **Task 62**: [src/features/simulation] Implement **Clash Detection** for assemblies. | *Priority: P1* | Success: Intersecting solids highlight in red.
- [ ] **Task 63**: [src/features/simulation] Add **Tolerance Stack-up Analyzer**. | *Priority: P2* | Success: Worst-case fit simulation.
- [ ] **Task 64**: [src/entities/material] Create **Material Property Database** (Density, E, CTE). | *Priority: P1* | Success: Auto-calculates Mass/CO2 footprint.
- [ ] **Task 65**: [src/features/simulation] Add **CO2 Footprint Estimator**. | *Priority: P2* | Success: Estimates kg/CO2 based on material and process.

## Phase 4: Evolutionary Design Oracle (Tasks 66-80)
- [ ] **Task 66**: [src/entities/evolution] Implement **Variant Spawner** (Zustand Branching). | *Priority: P0* | Success: Can fork history into 10 distinct paths.
- [ ] **Task 67**: [src/features/evolution] Implement **"Garden View" layout** (10-way Split Screen). | *Priority: P1* | Success: Visual comparison of 10 geometry variants.
- [ ] **Task 68**: [src/features/evolution] Implement **Genetic Mutation logic** (Parametric Randomization). | *Priority: P1* | Success: Spawns variants with +/- 20% slider values.
- [ ] **Task 69**: [src/features/evolution] Implement **Fitness Functions** (Weight, Strength, Cost). | *Priority: P1* | Success: Ranks variants by user-defined goals.
- [ ] **Task 70**: [src/features/evolution] Implement **Genetic Crossover** (Merge two variants). | *Priority: P2* | Success: Combines successful traits of two models.
- [ ] **Task 71**: [src/widgets/oracle] Build the **Oracle Goal Dashboard**. | *Priority: P1* | Success: Set sliders for "Max Strength" vs "Min Weight".
- [ ] **Task 72**: [src/features/evolution] Implement **Generative Lattice structures**. | *Priority: P2* | Success: Fills volume with 3D gyroid/lattice.
- [ ] **Task 73**: [src/features/evolution] Implement **Automatic Stress-Path Thinning**. | *Priority: P2* | Success: Removes material in low-stress zones.
- [ ] **Task 74**: [src/features/evolution] Add **User Feedback Loop** ("I like this one"). | *Priority: P1* | Success: AI prioritizes traits of selected variants.
- [ ] **Task 75**: [src/entities/evolution] Implement **Convergence Visualization**. | *Priority: P2* | Success: Graphs variant performance over generations.
- [ ] **Task 76**: [src/features/evolution] Implement **Multi-Objective Pareto optimization**. | *Priority: P2* | Success: Shows trade-off between Cost and Weight.
- [ ] **Task 77**: [src/features/evolution] Add **Organic/Generative Smoothing** (Subdivision). | *Priority: P2* | Success: Softens harsh boolean edges for casting.
- [ ] **Task 78**: [src/features/evolution] Implement **Assembly-Aware Evolution**. | *Priority: P2* | Success: Parts evolve without breaking mating constraints.
- [ ] **Task 79**: [src/widgets/oracle] Implement **"Promote to Main" workflow**. | *Priority: P1* | Success: Swaps current model with winning variant.
- [ ] **Task 80**: [src/features/evolution] Add **Cloud Compute Offloading** (for 100+ variants). | *Priority: P2* | Success: Heavy simulations run on server-side workers.

## Phase 5: Time-Machine & Swarm (Tasks 81-95)
- [ ] **Task 81**: [src/widgets/timeline] Implement the **Timeline Slider UI**. | *Priority: P0* | Success: Scrub through the History Tree visually.
- [ ] **Task 82**: [src/features/simulation] Implement **Degradation Matrix** (Corrosion/Wear). | *Priority: P1* | Success: Geometry morphs over "time" in the slider.
- [ ] **Task 83**: [src/features/simulation] Build **Predictive Fatigue Heatmap**. | *Priority: P1* | Success: Bright spots where failure is likely at Year 5.
- [ ] **Task 84**: [src/features/swarm] Implement **Vector Embedding generator** for parts. | *Priority: P1* | Success: Geometry converted to 1536-dim vector for search.
- [ ] **Task 85**: [src/shared/api/swarm] Integrate **Anonymous Failure Database**. | *Priority: P2* | Success: Warns if part matches known failure vectors in the swarm.
- [ ] **Task 86**: [src/features/swarm] Implement **Anonymization Proxy** for swarm data. | *Priority: P1* | Success: Zero IP leakage during swarm learning.
- [ ] **Task 87**: [src/features/simulation] Add **Maintenance Event Markers** to timeline. | *Priority: P2* | Success: Show when seals/bearings need replacement.
- [ ] **Task 88**: [src/widgets/timeline] Implement **"Future State" prediction**. | *Priority: P2* | Success: AI predicts how this part will look after 1000 cycles.
- [ ] **Task 89**: [src/features/swarm] Add **"Swarm Suggestions"** (Community-sourced fillets). | *Priority: P2* | Success: "Other users reinforced this corner."
- [ ] **Task 90**: [src/features/simulation] Implement **Thermal Expansion over time**. | *Priority: P2* | Success: Morph geometry based on temp profile slider.
- [ ] **Task 91**: [src/features/simulation] Add **Acoustic Signature prediction**. | *Priority: P2* | Success: "This part will vibrate at 440Hz".
- [ ] **Task 92**: [src/features/swarm] Implement **Collective Intelligence Mesh UI**. | *Priority: P2* | Success: Dashboard showing global part trends.
- [ ] **Task 93**: [src/features/simulation] Implement **Surface Finish degradation**. | *Priority: P2* | Success: Visualizes paint fading/pitting.
- [ ] **Task 94**: [src/features/simulation] Add **Life-Cycle Cost (LCC) chart**. | *Priority: P1* | Success: Shows Maintenance vs Acquisition cost.
- [ ] **Task 95**: [src/features/simulation] Implement **Time-Lapse Export**. | *Priority: P2* | Success: Generates MP4 of the design's 10-year lifecycle.

## Phase 6: Parasitic Agents & Desktop (Tasks 96-105)
- [ ] **Task 96**: [scripts/tauri] Configure **Tauri Desktop Wrapper**. | *Priority: P0* | Success: Cross-platform .exe/.app builds.
- [ ] **Task 97**: [src/shared/lib/fs] Implement **Local File System Access** (Tauri). | *Priority: P0* | Success: Open/Save .aether files locally.
- [ ] **Task 98**: [src/features/parasitic] Implement **Onshape DOM Overlay**. | *Priority: P1* | Success: Aether UI injected into Onshape browser tab.
- [ ] **Task 99**: [src/features/parasitic] Implement **Fusion 360 API Bridge**. | *Priority: P1* | Success: Two-way param sync between Aether and Fusion.
- [ ] **Task 100**: [src/features/parasitic] Implement **SolidWorks Add-in logic**. | *Priority: P1* | Success: Aether kernel driving SW geometry via COM.
- [ ] **Task 101**: [src/shared/ui] Build **Sandboxed Browser Widget**. | *Priority: P2* | Success: Browse McMaster-Carr inside the CAD.
- [ ] **Task 102**: [src/features/parasitic] Implement **Parasitic Context Menu**. | *Priority: P1* | Success: "Enhance with Aether" right-click in Onshape.
- [ ] **Task 103**: [src/features/parasitic] Implement **Geometry Sniffer** (Reverse-engineer DOM meshes). | *Priority: P1* | Success: Grabs raw mesh from legacy tools for AI analysis.
- [ ] **Task 104**: [src/shared/lib/ipc] Implement **Cross-Process Communication** (WASM to Desktop). | *Priority: P1* | Success: Fast IPC for large mesh data.
- [ ] **Task 105**: [src/features/parasitic] Add **Auto-Documenter** (Pushes Aether reasoning to legacy notes). | *Priority: P2* | Success: AI notes synced to Fusion 360 timeline.

## Phase 7: Collaboration, AR & Voice (Tasks 106-115)
- [ ] **Task 106**: [src/features/collaboration] Integrate **Yjs for CRDT Real-time Editing**. | *Priority: P0* | Success: Google Docs style CAD editing.
- [ ] **Task 107**: [src/widgets/collab] Build **Multi-user Presence** (Remote cursors). | *Priority: P1* | Success: See where team members are clicking.
- [ ] **Task 108**: [src/features/voice] Integrate **Web Speech API / Whisper**. | *Priority: P2* | Success: "Add a 2-inch sphere at the origin" via voice.
- [ ] **Task 109**: [src/features/ar] Implement **WebXR Viewport mode**. | *Priority: P1* | Success: View model on desk via mobile AR.
- [ ] **Task 110**: [src/features/ar] Implement **QR Code Generation** for AR Sharing. | *Priority: P1* | Success: Scan code to see model in physical space.
- [ ] **Task 111**: [src/widgets/collab] Add **Live Voice Chat** (WebRTC). | *Priority: P2* | Success: Talk while designing in-app.
- [ ] **Task 112**: [src/features/collaboration] Implement **Role-based Access Control (RBAC)**. | *Priority: P1* | Success: Read-only vs Editor permissions.
- [ ] **Task 113**: [src/features/collaboration] Add **Version Snapshots (Git-style)**. | *Priority: P1* | Success: Commit changes with message.
- [ ] **Task 114**: [src/features/ar] Add **AR Exploded View** animation. | *Priority: P2* | Success: Tap to see parts separate in AR.
- [ ] **Task 115**: [src/features/collaboration] Implement **Activity Feed** (Audit Trail). | *Priority: P1* | Success: Logs who changed what param and when.

## Phase 8: Production & Monetization (Tasks 116-125)
- [ ] **Task 116**: [src/features/billing] Integrate **Stripe for SaaS Subscriptions**. | *Priority: P0* | Success: Pro/Enterprise plan walls.
- [ ] **Task 117**: [src/shared/lib/analytics] Implement **Usage Analytics** (PostHog). | *Priority: P1* | Success: Tracks most-used primitives and AI features.
- [ ] **Task 118**: [docs/onboarding] Build **Interactive Archaeological Tutorial**. | *Priority: P1* | Success: 90% completion rate for new users.
- [ ] **Task 119**: [src/shared/lib/security] Implement **SOC2-ready Audit Logging**. | *Priority: P0* | Success: Every AI decision is immutable and logged.
- [ ] **Task 120**: [src/pages/marketplace] Build **Aether Plugin Marketplace**. | *Priority: P2* | Success: Third-party developers can sell simulation plugins.
- [ ] **Task 121**: [root] Setup **Playwright E2E testing** (WASM-heavy). | *Priority: P1* | Success: Automated tests for complex CSG.
- [ ] **Task 122**: [src/features/monetization] Implement **"Compute Credits"** for EDO Spawning. | *Priority: P1* | Success: Users pay for massive variant generation.
- [ ] **Task 123**: [src/shared/ui] Implement **Dark Mode "Ghost" variant** (Stealth UI). | *Priority: P2* | Success: Minimal distraction interface.
- [ ] **Task 124**: [root] **Dockerize Worker fleet** for scaling. | *Priority: P1* | Success: Horizontal scaling for thousands of users.
- [ ] **Task 125**: [src/pages/landing] Build **High-conversion Landing Page** with Three.js hero. | *Priority: P1* | Success: 5% conversion rate.
