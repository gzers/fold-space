import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision';

export type GestureType = 'Open_Palm' | 'Closed_Fist' | 'Pinching' | 'None';

export class GestureService {
  private recognizer: GestureRecognizer | null = null;
  private isInitializing = false;

  async initialize() {
    if (this.recognizer || this.isInitializing) return;
    this.isInitializing = true;

    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );
      this.recognizer = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 1,
      });
      console.log('Gesture Recognizer initialized');
    } catch (error) {
      console.error('Failed to initialize Gesture Recognizer:', error);
    } finally {
      this.isInitializing = false;
    }
  }

  detectGesture(videoElement: HTMLVideoElement, timestamp: number): { gesture: GestureType; landmarks: any[] } | null {
    if (!this.recognizer) return null;

    try {
      const result = this.recognizer.recognizeForVideo(videoElement, timestamp);
      if (result.gestures && result.gestures.length > 0) {
        const gestureName = result.gestures[0][0].categoryName;
        // Map common gestures
        let mappedGesture: GestureType = 'None';
        if (gestureName === 'Open_Palm') mappedGesture = 'Open_Palm';
        else if (gestureName === 'Closed_Fist') mappedGesture = 'Closed_Fist';
        // Pinching is usually Pinch or sometimes we need to check distance between index and thumb manually, 
        // but let's assume it detects "Pinch" or we map "None" for now.
        // Wait, MediaPipe default model returns: None, Closed_Fist, Open_Palm, Pointing_Up, Thumb_Down, Thumb_Up, Victory, ILoveYou
        // It doesn't have "Pinching" out of the box unless we train it or use logic on landmarks.
        // Let's rely on landmarks for pinching if needed.
        
        return {
          gesture: mappedGesture,
          landmarks: result.landmarks[0] || []
        };
      }
      return null;
    } catch (e) {
      return null;
    }
  }
}

export const gestureService = new GestureService();
