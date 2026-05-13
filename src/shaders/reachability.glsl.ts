export const reachabilityVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const reachabilityFragmentShader = `
  uniform vec3 toolVector;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    float dotProduct = dot(vNormal, normalize(toolVector));
    // 0.0 is reachable (facing tool), 1.0 is unreachable (backfacing or steep)
    float reachability = 1.0 - smoothstep(-0.2, 0.2, dotProduct);
    
    vec3 color;
    if (reachability < 0.3) {
      color = vec3(0.1, 0.8, 0.2); // Green: Easily Reachable
    } else if (reachability < 0.7) {
      color = vec3(0.9, 0.9, 0.1); // Yellow: Caution
    } else {
      color = vec3(0.8, 0.1, 0.1); // Red: Unreachable
    }
    
    gl_FragColor = vec4(color, 1.0);
  }
`;
