import { FACE_LANDMARK_INDEXES } from "./faceLandmarkIndexes.js";

function getLandmark(landmarks, index) {
  return landmarks[index] ?? null;
}

function getFaceWidth(landmarks) {
  const leftOuter = getLandmark(
    landmarks,
    FACE_LANDMARK_INDEXES.leftSide.outer,
  );

  const rightOuter = getLandmark(
    landmarks,
    FACE_LANDMARK_INDEXES.rightSide.outer,
  );

  if (!leftOuter || !rightOuter) {
    return 0;
  }

  return Math.abs(rightOuter.x - leftOuter.x);
}

function createEstimatedEarPoint(basePoint, faceWidth, side) {
  const horizontalDirection = side === "left" ? -1 : 1;
 // Calibración inicial para foto guiada a 30–45°,
  // con la oreja visible y la cabeza ligeramente inclinada.
  // Estos valores se ajustarán más adelante por producto y por lado visible
  return {
    x: basePoint.x + horizontalDirection * faceWidth * 0.108,
    y: basePoint.y + faceWidth * 0.18,
    z: basePoint.z,
  };
}

export function estimateEarAnchors(landmarks) {
  if (!Array.isArray(landmarks)) {
    return {
      left: null,
      right: null,
    };
  }

  const faceWidth = getFaceWidth(landmarks);

  if (!faceWidth) {
    return {
      left: null,
      right: null,
    };
  }

  const leftBase = getLandmark(
    landmarks,
    FACE_LANDMARK_INDEXES.leftSide.outer,
  );

  const rightBase = getLandmark(
    landmarks,
    FACE_LANDMARK_INDEXES.rightSide.outer,
  );

  return {
    left: leftBase
      ? createEstimatedEarPoint(leftBase, faceWidth, "left")
      : null,

    right: rightBase
      ? createEstimatedEarPoint(rightBase, faceWidth, "right")
      : null,
  };
}