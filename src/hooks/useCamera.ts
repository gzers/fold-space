import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';

let sharedCameraStream: MediaStream | null = null;

const hasActiveTracks = (stream: MediaStream | null) =>
  Boolean(stream && stream.getTracks().some((track) => track.readyState === 'live'));

export const useCamera = () => {
  const [stream, setStream] = useState<MediaStream | null>(sharedCameraStream);
  const { cameraPermission, setCameraPermission } = useAppStore();

  const requestPermission = async () => {
    if (hasActiveTracks(sharedCameraStream)) {
      setStream(sharedCameraStream);
      setCameraPermission('granted');
      return true;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      sharedCameraStream = mediaStream;
      setStream(mediaStream);
      setCameraPermission('granted');
      return true;
    } catch (err: any) {
      console.error('Camera permission denied or unavailable', err);
      sharedCameraStream = null;
      setStream(null);

      if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraPermission('unavailable');
      } else {
        setCameraPermission('denied');
      }

      return false;
    }
  };

  const stopCamera = () => {
    if (sharedCameraStream) {
      sharedCameraStream.getTracks().forEach((track) => track.stop());
      sharedCameraStream = null;
    }
    setStream(null);
  };

  return { stream, requestPermission, stopCamera, cameraPermission };
};
