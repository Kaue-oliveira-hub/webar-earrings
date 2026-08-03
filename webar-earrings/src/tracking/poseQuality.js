const POSE_QUALITY_THRESHOLDS = {
  minFaceWidth: 0.14,

  right: {
   minNoseRelativeX: 0.10,
  maxNoseRelativeX: 0.30,
  },

  left: {
    minNoseRelativeX: 0.51,
    maxNoseRelativeX: 0.66,
  },
};

function getPoseThresholds(side) {
  return side === "left"
    ? POSE_QUALITY_THRESHOLDS.left
    : POSE_QUALITY_THRESHOLDS.right;
}

export function evaluatePoseQuality(landmarks, options = {}) {
  if (!landmarks || landmarks.length === 0) {
    return {
      isValid: false,
      reason: "NO_LANDMARKS",
      message: "No se ha detectado bien el rostro.",
      metrics: null,
    };
  }

  const { visibleEarSide = "right" } = options;

  const leftOuter = landmarks[234];
  const rightOuter = landmarks[454];
  const noseTip = landmarks[1];

  if (!leftOuter || !rightOuter || !noseTip) {
    return {
      isValid: false,
      reason: "MISSING_REFERENCE_LANDMARKS",
      message: "No se ha detectado bien el rostro.",
      metrics: null,
    };
  }

  const faceWidth = Math.abs(rightOuter.x - leftOuter.x);

  if (faceWidth < POSE_QUALITY_THRESHOLDS.minFaceWidth) {
    return {
      isValid: false,
      reason: "FACE_TOO_SMALL",
      message: "Acércate un poco más.",
      metrics: {
        faceWidth,
        noseRelativeX: null,
      },
    };
  }

  const noseRelativeX = (noseTip.x - leftOuter.x) / faceWidth;
  const thresholds = getPoseThresholds(visibleEarSide);

  if (noseRelativeX > thresholds.maxNoseRelativeX) {
    return {
      isValid: false,
      reason: "TURN_MORE",
      message: "Gira un poco más la cabeza.",
      metrics: {
        faceWidth,
        noseRelativeX,
      },
    };
  }

  if (noseRelativeX < thresholds.minNoseRelativeX) {
    return {
      isValid: false,
      reason: "TURN_LESS",
      message: "Gira un poco menos la cabeza.",
      metrics: {
        faceWidth,
        noseRelativeX,
      },
    };
  }

  return {
    isValid: true,
    reason: "OK",
    message: null,
    metrics: {
      faceWidth,
      noseRelativeX,
    },
  };
}