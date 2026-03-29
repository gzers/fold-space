import { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';

export const useCamera = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const { cameraPermission, setCameraPermission } = useAppStore();

  const requestPermission = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setCameraPermission('granted');
      return true;
    } catch (err: any) {
      console.error('Camera permission denied or unavailable', err);
      if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraPermission('unavailable');
      } else {
        setCameraPermission('denied');
      }
      return false;
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopCamera();
    };
  }, [stream]);

  return { stream, requestPermission, stopCamera, cameraPermission };
};
