function getNoseRelativeX(landmarks) {
  const leftOuter = landmarks?.[234];
  const rightOuter = landmarks?.[454];
  const noseTip = landmarks?.[1];

  if (!leftOuter || !rightOuter || !noseTip) {
    return null;
  }

  const faceWidth = Math.abs(rightOuter.x - leftOuter.x);

  if (!faceWidth) {
    return null;
  }

  return (noseTip.x - leftOuter.x) / faceWidth;
}

export function detectGuidedEarSide(landmarks, fallbackSide = "right") {
  const noseRelativeX = getNoseRelativeX(landmarks);

  if (noseRelativeX == null) {
    return fallbackSide;
  }

  // Invertido por cámara frontal / canvas espejado.
  return noseRelativeX <= 0.5 ? "left" : "right";
}

export function getGuidedEarAnchor(config, side = "right") {
  const target = config.guidedEarTarget?.[side];

  if (!target) {
    return null;
  }

  return {
    x: target.x,
    y: target.y,
    z: 0,
  };
}

export function applyGuidedEarTargetToElement(element, config, side = "right") {
  if (!(element instanceof HTMLElement)) {
    return;
  }

  const target = config.guidedEarTarget?.[side];

  if (!target) {
    return;
  }

  element.style.setProperty("--ear-target-x", `${target.x * 100}%`);
  element.style.setProperty("--ear-target-y", `${target.y * 100}%`);
}