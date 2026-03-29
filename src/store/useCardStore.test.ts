import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCardStore } from './useCardStore';
import { dbHooks } from '../db/hooks';
import type { Fold } from '../db';

vi.mock('../db/hooks', () => ({
  dbHooks: {
    getAllFolds: vi.fn(),
    saveFold: vi.fn(),
    moveToTrash: vi.fn(),
  }
}));

describe('useCardStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCardStore.setState({
      folds: [],
      selectedFoldId: null,
      isLoading: true,
    });
  });

  it('should load folds', async () => {
    const mockFolds: Fold[] = [
      { id: 1, content: 'Test', timestamp: 123, emotion: 'calm', position: { x: 0, y: 0 }, tags: [], connections: [] }
    ];
    (dbHooks.getAllFolds as any).mockResolvedValue(mockFolds);

    await useCardStore.getState().loadFolds();

    const state = useCardStore.getState();
    expect(state.isLoading).toBe(false);
    expect(state.folds).toEqual(mockFolds);
    expect(dbHooks.getAllFolds).toHaveBeenCalledTimes(1);
  });

  it('should add a fold', async () => {
    (dbHooks.saveFold as any).mockResolvedValue(2);

    const newFold = { content: 'New Fold', timestamp: 123, emotion: 'warm', position: { x: 10, y: 10 }, tags: [], connections: [] };
    await useCardStore.getState().addFold(newFold);

    const state = useCardStore.getState();
    expect(state.folds).toHaveLength(1);
    expect(state.folds[0]).toEqual({ ...newFold, id: 2 });
    expect(dbHooks.saveFold).toHaveBeenCalledWith(newFold);
  });

  it('should update fold position', async () => {
    const initialFold: Fold = { id: 1, content: 'Test', timestamp: 123, emotion: 'calm', position: { x: 0, y: 0 }, tags: [], connections: [] };
    useCardStore.setState({ folds: [initialFold] });
    
    (dbHooks.saveFold as any).mockResolvedValue(1);

    await useCardStore.getState().updateFoldPosition(1, { x: 100, y: 200 });

    const state = useCardStore.getState();
    expect(state.folds[0].position).toEqual({ x: 100, y: 200 });
    expect(dbHooks.saveFold).toHaveBeenCalledWith({ ...initialFold, position: { x: 100, y: 200 } });
  });

  it('should add connection', async () => {
    const fold1: Fold = { id: 1, content: 'Test 1', timestamp: 123, emotion: 'calm', position: { x: 0, y: 0 }, tags: [], connections: [] };
    const fold2: Fold = { id: 2, content: 'Test 2', timestamp: 124, emotion: 'calm', position: { x: 10, y: 10 }, tags: [], connections: [] };
    
    useCardStore.setState({ folds: [fold1, fold2] });
    (dbHooks.saveFold as any).mockResolvedValue(1);

    await useCardStore.getState().addConnection(1, 2);

    const state = useCardStore.getState();
    expect(state.folds[0].connections).toContain(2);
    expect(dbHooks.saveFold).toHaveBeenCalledWith({ ...fold1, connections: [2] });
  });

  it('should remove fold to trash', async () => {
    const fold1: Fold = { id: 1, content: 'Test 1', timestamp: 123, emotion: 'calm', position: { x: 0, y: 0 }, tags: [], connections: [] };
    
    useCardStore.setState({ folds: [fold1], selectedFoldId: 1 });
    (dbHooks.moveToTrash as any).mockResolvedValue(undefined);

    await useCardStore.getState().removeFold(1);

    const state = useCardStore.getState();
    expect(state.folds).toHaveLength(0);
    expect(state.selectedFoldId).toBeNull();
    expect(dbHooks.moveToTrash).toHaveBeenCalledWith(1);
  });
});
