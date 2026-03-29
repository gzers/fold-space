import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';

let sharedMicrophoneStream: MediaStream | null = null;

const hasActiveTracks = (stream: MediaStream | null) =>
  Boolean(stream && stream.getTracks().some((track) => track.readyState === 'live'));

export const useMicrophone = () => {
  const [stream, setStream] = useState<MediaStream | null>(sharedMicrophoneStream);
  const { micPermission, setMicPermission } = useAppStore();

  const requestPermission = async () => {
    if (hasActiveTracks(sharedMicrophoneStream)) {
      setStream(sharedMicrophoneStream);
      setMicPermission('granted');
      return true;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      sharedMicrophoneStream = mediaStream;
      setStream(mediaStream);
      setMicPermission('granted');
      return true;
    } catch (err: any) {
      console.error('Microphone permission denied or unavailable', err);
      sharedMicrophoneStream = null;
      setStream(null);

      if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setMicPermission('unavailable');
      } else {
        setMicPermission('denied');
      }

      return false;
    }
  };

  const stopMicrophone = () => {
    if (sharedMicrophoneStream) {
      sharedMicrophoneStream.getTracks().forEach((track) => track.stop());
      sharedMicrophoneStream = null;
    }
    setStream(null);
  };

  return { stream, requestPermission, stopMicrophone, micPermission };
};
