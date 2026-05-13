export interface AgentAction {
  type: 'ADD_NODE' | 'UPDATE_NODE' | 'REMOVE_NODE' | 'ANALYZE';
  payload?: any;
  agent: string;
  message: string;
}

export class OracleCore {
  async process(input: string): Promise<AgentAction> {
    const text = input.toLowerCase();

    if (text.includes('cube') || text.includes('box')) {
      return {
        agent: 'GeometryAgent',
        type: 'ADD_NODE',
        payload: { type: 'Box', params: { width: 2, height: 2, depth: 2 } },
        message: 'GeometryAgent: Synthesizing cubic lattice at origin.',
      };
    }

    if (text.includes('sphere') || text.includes('ball')) {
      return {
        agent: 'GeometryAgent',
        type: 'ADD_NODE',
        payload: { type: 'Sphere', params: { radius: 1.5, segments: 32 } },
        message: 'GeometryAgent: Projecting spherical manifold.',
      };
    }

    if (text.includes('cost') || text.includes('price') || text.includes('bom')) {
      return {
        agent: 'BOMAgent',
        type: 'ANALYZE',
        message: 'BOMAgent: Calculating material volumetrics and supply-chain risk...',
      };
    }

    if (text.includes('make') || text.includes('print') || text.includes('manufacture')) {
      return {
        agent: 'ManufacturingAgent',
        type: 'ANALYZE',
        message: 'ManufacturingAgent: Performing GMS Twin simulation for CNC toolpaths.',
      };
    }

    return {
      agent: 'OracleCore',
      type: 'ANALYZE',
      message: 'Oracle Core: Nexus connected. Awaiting high-fidelity instructions.',
    };
  }
}

export const oracle = new OracleCore();
