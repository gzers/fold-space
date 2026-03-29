import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from './useAppStore';

describe('useAppStore', () => {
  beforeEach(() => {
    useAppStore.setState({
      cameraPermission: 'idle',
      micPermission: 'idle',
      isLightweightMode: false,
    });
  });

  it('should initialize with default values', () => {
    const state = useAppStore.getState();
    expect(state.cameraPermission).toBe('idle');
    expect(state.micPermission).toBe('idle');
    expect(state.isLightweightMode).toBe(false);
  });

  it('should update cameraPermission', () => {
    useAppStore.getState().setCameraPermission('granted');
    expect(useAppStore.getState().cameraPermission).toBe('granted');
    
    useAppStore.getState().setCameraPermission('denied');
    expect(useAppStore.getState().cameraPermission).toBe('denied');
  });

  it('should update micPermission', () => {
    useAppStore.getState().setMicPermission('granted');
    expect(useAppStore.getState().micPermission).toBe('granted');
  });

  it('should toggle lightweight mode', () => {
    useAppStore.getState().toggleLightweightMode();
    expect(useAppStore.getState().isLightweightMode).toBe(true);

    useAppStore.getState().toggleLightweightMode();
    expect(useAppStore.getState().isLightweightMode).toBe(false);
  });
});
