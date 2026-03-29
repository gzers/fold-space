import { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';

export const useMicrophone = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const { micPermission, setMicPermission } = useAppStore();

  const requestPermission = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(mediaStream);
      setMicPermission('granted');
      return true;
    } catch (err: any) {
      console.error('Microphone permission denied or unavailable', err);
      if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setMicPermission('unavailable');
      } else {
        setMicPermission('denied');
      }
      return false;
    }
  };

  const stopMicrophone = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    return () => {
      stopMicrophone();
    };
  }, [stream]);

  return { stream, requestPermission, stopMicrophone, micPermission };
};
