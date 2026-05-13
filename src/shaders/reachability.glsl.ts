export const reachabilityVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const reachabilityFragmentShader = `
  uniform vec3 toolVector;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;

  void main() {
    vec3 viewDir = normalize(-vPosition);
    vec3 worldNormal = vNormal;
    float dotProduct = dot(worldNormal, normalize(toolVector));

    // Reachability heatmap logic
    // 1.0 = direct access, 0.0 = perpendicular, -1.0 = obscured
    float angle = dotProduct;

    vec3 color;
    if (angle > 0.5) {
      // Optimal (Green)
      color = mix(vec3(0.1, 0.8, 0.2), vec3(0.5, 0.9, 0.3), (angle - 0.5) * 2.0);
    } else if (angle > 0.0) {
      // Sub-optimal (Yellow)
      color = mix(vec3(0.9, 0.9, 0.1), vec3(0.1, 0.8, 0.2), angle * 2.0);
    } else if (angle > -0.2) {
      // Difficult (Orange)
      color = mix(vec3(0.9, 0.5, 0.1), vec3(0.9, 0.9, 0.1), (angle + 0.2) * 5.0);
    } else {
      // Unreachable (Red)
      color = vec3(0.8, 0.1, 0.1);
    }

    // Add some subtle grid or contour lines
    float grid = abs(sin(vPosition.x * 10.0) * sin(vPosition.y * 10.0) * sin(vPosition.z * 10.0));
    color *= (0.9 + 0.1 * smoothstep(0.0, 0.1, grid));

    // Simple shading
    float diff = max(dot(vNormal, vec3(1.0, 1.0, 1.0)), 0.2);
    gl_FragColor = vec4(color * diff, 1.0);
  }
`;
