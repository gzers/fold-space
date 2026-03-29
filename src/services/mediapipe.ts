import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision';

export type GestureType = 'Open_Palm' | 'Closed_Fist' | 'Thumb_Down' | 'Pinching' | 'None';

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
        let mappedGesture: GestureType = 'None';

        if (gestureName === 'Open_Palm') mappedGesture = 'Open_Palm';
        else if (gestureName === 'Closed_Fist') mappedGesture = 'Closed_Fist';
        else if (gestureName === 'Thumb_Down') mappedGesture = 'Thumb_Down';

        return {
          gesture: mappedGesture,
          landmarks: result.landmarks[0] || [],
        };
      }
      return null;
    } catch {
      return null;
    }
  }
}

export const gestureService = new GestureService();
