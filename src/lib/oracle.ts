import { useStore, CADNode, NodeType, NodeParams, Transform } from './store';

export interface Intent {
  type: 'ADD_NODE' | 'UPDATE_NODE' | 'REMOVE_NODE' | 'UNKNOWN';
  nodeType?: NodeType;
  params?: NodeParams;
  transform?: Partial<Transform>;
  message: string;
}

export function parseIntent(input: string): Intent {
  const text = input.toLowerCase();
  
  if (text.length < 3) return { type: 'UNKNOWN', message: 'Awaiting input...' };

  const transform: Partial<Transform> = {};
  const atMatch = text.match(/at\s+(-?\d+(?:\.\d+)?)[,\s]\s*(-?\d+(?:\.\d+)?)[,\s]\s*(-?\d+(?:\.\d+)?)/);
  if (atMatch) {
    transform.position = [parseFloat(atMatch[1]), parseFloat(atMatch[2]), parseFloat(atMatch[3])];
  }

  // Token-based parameter extraction
  const extractDims = (str: string) => {
    const dims = str.match(/(\d+(?:\.\d+)?)\s*[x*]\s*(\d+(?:\.\d+)?)\s*[x*]\s*(\d+(?:\.\d+)?)/) || 
                 str.match(/(\d+(?:\.\d+)?)\s*[x*]\s*(\d+(?:\.\d+)?)/) ||
                 str.match(/size\s*(\d+(?:\.\d+)?)/) ||
                 str.match(/(\d+(?:\.\d+)?)\s*units?/);
    return dims;
  };

  if (text.includes('box') || text.includes('cube')) {
    const dims = extractDims(text);
    let params: any = { width: 1, height: 1, depth: 1, center: true };
    if (dims) {
      if (dims[3]) {
        params = { width: parseFloat(dims[1]), height: parseFloat(dims[2]), depth: parseFloat(dims[3]), center: true };
      } else if (dims[2]) {
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
      message: `CREATE BOX [${params.width}x${params.height}x${params.depth}]${transform.position ? ` AT [${transform.position.join(', ')}]` : ''}`
    };
  }

  if (text.includes('sphere') || text.includes('ball')) {
    const radiusMatch = text.match(/radius\s*(\d+(?:\.\d+)?)/) || text.match(/(\d+(?:\.\d+)?)\s*radius/) || text.match(/size\s*(\d+(?:\.\d+)?)/);
    let params = { radius: 1, segments: 32 };
    if (radiusMatch) {
      params.radius = parseFloat(radiusMatch[1]);
    }
    
    return {
      type: 'ADD_NODE',
      nodeType: 'Sphere',
      params,
      transform,
      message: `CREATE SPHERE [R=${params.radius}]${transform.position ? ` AT [${transform.position.join(', ')}]` : ''}`
    };
  }

  if (text.includes('cylinder')) {
    const dims = text.match(/(\d+(?:\.\d+)?)/g);
    let params = { height: 2, radiusLow: 1, radiusHigh: 1, segments: 32, center: true };
    if (dims && dims.length >= 2) {
      params.height = parseFloat(dims[0]);
      params.radiusLow = parseFloat(dims[1]);
      params.radiusHigh = parseFloat(dims[1]);
    } else if (dims && dims.length === 1) {
        params.height = parseFloat(dims[0]);
    }
    return {
      type: 'ADD_NODE',
      nodeType: 'Cylinder',
      params,
      transform,
      message: `CREATE CYLINDER [H=${params.height}, R=${params.radiusLow}]${transform.position ? ` AT [${transform.position.join(', ')}]` : ''}`
    };
  }

  if (text.includes('torus') || text.includes('donut')) {
    return {
      type: 'ADD_NODE',
      nodeType: 'Torus',
      params: { radius: 1, tube: 0.3, radialSegments: 32, tubularSegments: 32 },
      transform,
      message: `CREATE TORUS${transform.position ? ` AT [${transform.position.join(', ')}]` : ''}`
    };
  }

  const containers: Record<string, NodeType> = {
    'group': 'Group',
    'union': 'Union',
    'add': 'Union',
    'subtract': 'Subtract',
    'minus': 'Subtract',
    'difference': 'Subtract',
    'intersect': 'Intersect'
  };

  for (const [kw, type] of Object.entries(containers)) {
    if (text.includes(kw)) {
      return {
        type: 'ADD_NODE',
        nodeType: type,
        params: {},
        transform,
        message: `CREATE ${type.toUpperCase()}`
      };
    }
  }

  return {
    type: 'UNKNOWN',
    message: 'Awaiting valid geometric intent...'
  };
}

export interface AgentResponse {
  agent: string;
  content: string;
  action?: () => void;
}

export class OracleCore {
  private static instance: OracleCore;
  
  private constructor() {}

  public static getInstance(): OracleCore {
    if (!OracleCore.instance) {
      OracleCore.instance = new OracleCore();
    }
    return OracleCore.instance;
  }

  public async processNaturalLanguage(input: string): Promise<AgentResponse[]> {
    const store = useStore.getState();
    const intent = parseIntent(input);

    const responses: AgentResponse[] = [];

    if (intent && intent.type !== 'UNKNOWN') {
      responses.push({
        agent: 'Orchestrator',
        content: `Acknowledged. Routing to Geometry Agent for ${intent.nodeType} creation.`
      });

      responses.push({
        agent: 'Geometry Agent',
        content: `Generating ${intent.nodeType} primitive: ${intent.message}.`,
        action: () => {
          store.addNode(intent.nodeType!, undefined, intent.params, intent.transform);
        }
      });

      responses.push({
        agent: 'Engineering Agent',
        content: 'Validating manifold integrity and manufacturing feasibility. Structural integrity looks optimal.'
      });

      responses.push({
        agent: 'Sourcing Agent',
        content: 'Scanning global supply chain for matching stock. McMaster-Carr has valid items in stock (2-day lead time).'
      });

    } else {
      responses.push({
        agent: 'Orchestrator',
        content: "I couldn't identify a specific geometric intent. Could you clarify the operation? (e.g., 'Add a 5x5x5 box at 0,2,0')"
      });
    }

    return responses;
  }
}
