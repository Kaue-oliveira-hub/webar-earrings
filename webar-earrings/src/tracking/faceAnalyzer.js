import {
  FaceLandmarker,
  FilesetResolver,
} from "@mediapipe/tasks-vision";

const WASM_FILES_PATH =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";

const FACE_LANDMARKER_MODEL_PATH =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task";

export class FaceAnalyzer {
  constructor() {
    this.faceLandmarker = null;
    this.isReady = false;
  }

  async initialize() {
    if (this.isReady) {
      return;
    }

    const vision = await FilesetResolver.forVisionTasks(WASM_FILES_PATH);

    this.faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: FACE_LANDMARKER_MODEL_PATH,
        delegate: "GPU",
      },
      runningMode: "IMAGE",
      numFaces: 1,
      outputFaceBlendshapes: false,
      outputFacialTransformationMatrixes: true,
    });

    this.isReady = true;
  }

  analyzeImage(imageSource) {
    if (!this.isReady || !this.faceLandmarker) {
      throw new Error("FACE_ANALYZER_NOT_READY");
    }

    const result = this.faceLandmarker.detect(imageSource);

    return {
      hasFace: result.faceLandmarks.length > 0,
      landmarks: result.faceLandmarks[0] ?? null,
      transformationMatrix:
        result.facialTransformationMatrixes?.[0] ?? null,
      rawResult: result,
    };
  }
}