export type Primitive =
  | { type: "cylinder"; radius: number; height: number; pos: [number, number, number] }
  | { type: "box"; width: number; height: number; depth: number; pos: [number, number, number] }
  | { type: "sphere"; radius: number; pos: [number, number, number] };

export type BRepResult = {
  type: "brep";
  success: boolean;
  payload: unknown;
};

export class GeometryController {
  static async booleanOperation(
    operation: "union" | "subtract",
    bodyA: Primitive,
    bodyB: Primitive,
  ): Promise<BRepResult> {
    try {
      // Placeholder for WASM manifold-3d integration.
      // Replace with actual `manifold-3d` calls once the package is available.
      return {
        type: "brep",
        success: true,
        payload: { operation, bodyA, bodyB },
      };
    } catch (error) {
      return {
        type: "brep",
        success: false,
        payload: error,
      };
    }
  }
}
