import { describe, it, expect, vi, beforeAll } from 'vitest';

// Mock worker and URL
const mockPostMessage = vi.fn();
const mockTerminate = vi.fn();

beforeAll(() => {
  global.Worker = vi.fn().mockImplementation(() => ({
    postMessage: mockPostMessage,
    onmessage: vi.fn(),
    terminate: mockTerminate,
  })) as any;

  global.window = {
    location: { origin: 'http://localhost' }
  } as any;

  const OriginalURL = global.URL;
  global.URL = class extends OriginalURL {
    constructor(url: string | URL, base?: string | URL) {
        super(url, base || 'http://localhost');
    }
  } as any;
});

describe('CAD Library Async Interface', () => {
  it('should attempt to rebuild geometry via worker', async () => {
    const { rebuildGeometryAsync } = await import('@/shared/lib/cad');

    const nodes = [{ id: '1', type: 'Box', params: {}, transform: { position: [0,0,0], rotation: [0,0,0], scale: [1,1,1] }, operation: 'Add', visible: true }];

    rebuildGeometryAsync(nodes);

    expect(global.Worker).toHaveBeenCalled();
    expect(mockPostMessage).toHaveBeenCalledWith(expect.objectContaining({ type: 'REBUILD', nodes }));
  });
});
