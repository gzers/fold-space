import { create } from 'zustand';

export type PermissionStatus = 'idle' | 'granted' | 'denied' | 'unavailable';

interface AppState {
  cameraPermission: PermissionStatus;
  micPermission: PermissionStatus;
  isLightweightMode: boolean;
  setCameraPermission: (status: PermissionStatus) => void;
  setMicPermission: (status: PermissionStatus) => void;
  toggleLightweightMode: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  cameraPermission: 'idle',
  micPermission: 'idle',
  isLightweightMode: false,
  setCameraPermission: (status) => set({ cameraPermission: status }),
  setMicPermission: (status) => set({ micPermission: status }),
  toggleLightweightMode: () => set((state) => ({ isLightweightMode: !state.isLightweightMode })),
}));
