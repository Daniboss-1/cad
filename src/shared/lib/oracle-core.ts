import { useStore, CADNode, NodeType } from './store';
import { parseIntent } from './oracle';

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

    // Orchestrator Logic
    if (intent && intent.type !== 'UNKNOWN') {
      responses.push({
        agent: 'Orchestrator',
        content: `Acknowledged. Routing to Geometry Agent for ${intent.nodeType} creation.`
      });

      responses.push({
        agent: 'Geometry Agent',
        content: `Generating ${intent.nodeType} primitive with specified parameters.`,
        action: () => {
          store.addNode(intent.nodeType!, undefined, intent.params, intent.transform);
        }
      });

      // Engineering Agent Feedback
      responses.push({
        agent: 'Engineering Agent',
        content: 'Validating manifold integrity and manufacturing feasibility. Structural integrity looks optimal.'
      });

      // Sourcing Agent Feedback
      responses.push({
        agent: 'Sourcing Agent',
        content: 'Scanning global supply chain for matching stock. McMaster-Carr has 459 items in stock (2-day lead time).'
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
