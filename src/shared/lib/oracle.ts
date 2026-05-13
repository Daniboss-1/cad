import { NodeType } from './store';

export interface Intent {
  type: 'ADD_NODE' | 'UPDATE_NODE' | 'REMOVE_NODE' | 'UNKNOWN';
  nodeType?: NodeType;
  params?: any;
  transform?: any;
  message: string;
}

export function parseIntent(input: string): Intent | null {
  const text = input.toLowerCase();

  if (text.length < 3) return null;

  const atMatch = text.match(/at\s+(-?\d+(?:\.\d+)?)[,\s]\s*(-?\d+(?:\.\d+)?)[,\s]\s*(-?\d+(?:\.\d+)?)/);
  let transform: any = {};
  if (atMatch) {
    transform.position = [parseFloat(atMatch[1]), parseFloat(atMatch[2]), parseFloat(atMatch[3])];
  }

  if (text.includes('box') || text.includes('cube')) {
    const dims = text.match(/(\d+(?:\.\d+)?)\s*[x*]\s*(\d+(?:\.\d+)?)\s*[x*]\s*(\d+(?:\.\d+)?)/) ||
                 text.match(/(\d+(?:\.\d+)?)\s*[x*]\s*(\d+(?:\.\d+)?)/) ||
                 text.match(/size\s*(\d+(?:\.\d+)?)/);
    let params = { width: 1, height: 1, depth: 1, center: true };
    if (dims) {
      if (dims.length === 4) {
        params = { width: parseFloat(dims[1]), height: parseFloat(dims[2]), depth: parseFloat(dims[3]), center: true };
      } else if (dims.length === 3) {
        params = { width: parseFloat(dims[1]), height: parseFloat(dims[2]), depth: parseFloat(dims[1]), center: true };
      } else {
        const s = parseFloat(dims[1]);
        params = { width: s, height: s, depth: s, center: true };
      }
    }

    return {
      type: 'ADD_NODE',
      nodeType: 'Box',
      params,
      transform,
      message: `ORACLE: CREATE BOX [${params.width}x${params.height}x${params.depth}]${transform.position ? ` AT [${transform.position.join(', ')}]` : ''}`
    };
  }

  if (text.includes('sphere') || text.includes('ball')) {
    const radiusMatch = text.match(/radius\s*(\d+(?:\.\d+)?)/) || text.match(/(\d+(?:\.\d+)?)\s*radius/);
    let params = { radius: 1, segments: 32 };
    if (radiusMatch) {
      params.radius = parseFloat(radiusMatch[1]);
    }

    return {
      type: 'ADD_NODE',
      nodeType: 'Sphere',
      params,
      transform,
      message: `ORACLE: CREATE SPHERE [R=${params.radius}]${transform.position ? ` AT [${transform.position.join(', ')}]` : ''}`
    };
  }

  if (text.includes('cylinder')) {
    const dims = text.match(/(\d+(?:\.\d+)?)/g);
    let params = { height: 2, radiusLow: 1, radiusHigh: 1, segments: 32, center: true };
    if (dims && dims.length >= 2) {
      params.height = parseFloat(dims[0]);
      params.radiusLow = parseFloat(dims[1]);
      params.radiusHigh = parseFloat(dims[1]);
    }
    return {
      type: 'ADD_NODE',
      nodeType: 'Cylinder',
      params,
      transform,
      message: `ORACLE: CREATE CYLINDER [H=${params.height}, R=${params.radiusLow}]${transform.position ? ` AT [${transform.position.join(', ')}]` : ''}`
    };
  }

  if (text.includes('torus') || text.includes('donut')) {
    return {
      type: 'ADD_NODE',
      nodeType: 'Torus',
      transform,
      message: `ORACLE: CREATE TORUS${transform.position ? ` AT [${transform.position.join(', ')}]` : ''}`
    };
  }

  if (text.includes('group')) {
    return {
      type: 'ADD_NODE',
      nodeType: 'Group',
      transform,
      message: 'ORACLE: CREATE GROUP'
    };
  }

  if (text.includes('union') || text.includes('add')) {
    return {
      type: 'ADD_NODE',
      nodeType: 'Union',
      transform,
      message: 'ORACLE: BOOLEAN UNION'
    };
  }

  if (text.includes('subtract') || text.includes('minus') || text.includes('difference')) {
    return {
      type: 'ADD_NODE',
      nodeType: 'Subtract',
      transform,
      message: 'ORACLE: BOOLEAN SUBTRACT'
    };
  }

  if (text.includes('intersect')) {
    return {
      type: 'ADD_NODE',
      nodeType: 'Intersect',
      transform,
      message: 'ORACLE: BOOLEAN INTERSECT'
    };
  }

  return {
    type: 'UNKNOWN',
    message: 'ORACLE: AWAITING VALID GEOMETRIC INTENT'
  };
}
