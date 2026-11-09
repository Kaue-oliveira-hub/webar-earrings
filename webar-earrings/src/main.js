import "./style.css";
import { CameraController } from "./camera/cameraController.js";
import { PhotoCapture } from "./capture/photoCapture.js";
import { FaceAnalyzer } from "./tracking/faceAnalyzer.js";
import { LandmarkDebugRenderer } from "./rendering/landmarkDebugRenderer.js";
import { EAR_DEBUG_LANDMARK_INDEXES } from "./tracking/faceLandmarkIndexes.js";
import { estimateEarAnchors } from "./tracking/earEstimator.js";
import { TRY_ON_CONFIG } from "./config/tryOnConfig.js";
import { EarringRenderer } from "./rendering/earringRenderer.js";
import {
  DEFAULT_EARRING_VARIANT,
  getAllEarringVariants,
} from "./products/earringProducts.js";
import { evaluatePoseQuality } from "./tracking/poseQuality.js";
import {
  applyGuidedEarTargetToElement,
  detectGuidedEarSide,
  getGuidedEarAnchor,
} from "./tracking/guidedEarTarget.js";

document.querySelector("#app").innerHTML = `
  <main class="app">
    <section class="product-preview">
      <div class="product-preview__content">
        <p class="eyebrow">Virtual try-on</p>

        <h1>Try on earrings</h1>

        <p class="product-preview__description">
          Use your front camera to see how earrings look on you.
          For the best results, use good lighting.
        </p>

        <button
          id="open-camera-button"
          class="button button--primary"
          type="button"
        >
          Try on earrings
        </button>
      </div>
    </section>
<section
  id="camera-modal"
  class="camera-modal"
  aria-hidden="true"
  aria-labelledby="camera-modal-title"
>
  <div
    class="camera-modal__dialog"
    role="dialog"
    aria-modal="true"
  >
    <header class="camera-modal__header">
      <div>
        <h2 id="camera-modal-title">Virtual try-on</h2>
      </div>

      <button
        id="close-camera-button"
        class="icon-button"
        type="button"
        aria-label="Close camera"
      >
        <span aria-hidden="true">×</span>
      </button>
    </header>

    <div class="camera-view">
      <video
        id="camera-video"
        class="camera-view__video"
        autoplay
        muted
        playsinline
      ></video>
<div 
id="camera-loading" 
class="camera-loading 
is-hidden">
</div>
      <canvas
        id="capture-canvas"
        class="camera-view__canvas"
      ></canvas>

      <canvas
        id="debug-canvas"
        class="camera-view__debug-canvas"
      ></canvas>

      <canvas
        id="earring-canvas"
        class="camera-view__earring-canvas"
      ></canvas>

      <div
        id="camera-guide"
        class="camera-view__guide"
        aria-hidden="true"
      >
        <div class="pose-guide">
          <div class="pose-guide__target" aria-hidden="true">
            <span class="pose-guide__target-dot"></span>
          </div>

       <div class="pose-guide__label" id="pose-guide-message">
  <span>Turn your head slightly and align your earlobe with the guide</span>

  <button
    id="pose-guide-dismiss"
    class="pose-guide__dismiss"
    type="button"
    aria-label="Dismiss guide"
  >
    ×
  </button>
</div>
        </div>
      </div>

      <div
        id="camera-placeholder"
        class="camera-view__placeholder"
      >
      </div>
    </div>

    <div
      id="camera-status"
      class="camera-status"
      role="status"
      aria-live="polite"
    ></div>

    <div
      id="variant-selector"
      class="variant-selector"
      aria-label="Select an earring"
    ></div>

    <footer class="camera-modal__footer">
      <button
        id="start-camera-button"
        class="button button--primary"
        type="button"
      >
        Enable camera
      </button>

      <button
        id="capture-photo-button"
        class="capture-button is-hidden"
        type="button"
        aria-label="Take photo"
      >
        <span class="capture-button__outer">
          <span class="capture-button__inner"></span>
        </span>
      </button>

      <button
  id="retake-photo-button"
  class="secondary-icon-button is-hidden"
  type="button"
  aria-label="Retake photo"
>
  <span aria-hidden="true">↺</span>
</button>

      
    </footer>
  </div>
</section>
  </main>
`;

const openCameraButton = document.querySelector("#open-camera-button");
const closeCameraButton = document.querySelector("#close-camera-button");
const startCameraButton = document.querySelector("#start-camera-button");
const capturePhotoButton = document.querySelector("#capture-photo-button");
const retakePhotoButton = document.querySelector("#retake-photo-button");

const cameraModal = document.querySelector("#camera-modal");
const cameraStatus = document.querySelector("#camera-status");
const cameraVideo = document.querySelector("#camera-video");
const cameraPlaceholder = document.querySelector("#camera-placeholder");
const cameraView = document.querySelector(".camera-view");
const cameraGuide = document.querySelector("#camera-guide");
const cameraLoading = document.querySelector("#camera-loading");

const captureCanvas = document.querySelector("#capture-canvas");
const debugCanvas = document.querySelector("#debug-canvas");
const earringCanvas = document.querySelector("#earring-canvas");
const variantSelector = document.querySelector("#variant-selector");

const poseGuideMessage = document.querySelector("#pose-guide-message");
const poseGuideDismiss = document.querySelector("#pose-guide-dismiss");

const cameraController = new CameraController(cameraVideo);
const photoCapture = new PhotoCapture(cameraVideo, captureCanvas, cameraView);
const faceAnalyzer = new FaceAnalyzer();
const landmarkDebugRenderer = new LandmarkDebugRenderer(debugCanvas);
const earringRenderer = new EarringRenderer(earringCanvas);

const earringVariants = getAllEarringVariants();

let selectedEarringVariant = DEFAULT_EARRING_VARIANT;
let lastCaptureData = null;

let activeGuidedEarSide = TRY_ON_CONFIG.visibleEarSide;
let guideTrackingFrameId = null;
let lastGuideTrackingTime = 0;
let guideMessageTimeoutId = null;
let hasShownGuideMessage = false;

function setModalState(state) {
  cameraModal.dataset.state = state;

  const isCameraActive = state === "live" || state === "captured";
  cameraModal.classList.toggle("is-camera-active", isCameraActive);
}
const GUIDE_TRACKING_INTERVAL = 180;



function showGuideMessage() {
  if (hasShownGuideMessage) return;

  poseGuideMessage.classList.remove("is-hidden");
  hasShownGuideMessage = true;

  if (guideMessageTimeoutId) {
    clearTimeout(guideMessageTimeoutId);
  }

  guideMessageTimeoutId = window.setTimeout(() => {
    poseGuideMessage.classList.add("is-hidden");
  }, 7000);
}

function hideGuideMessage() {
  poseGuideMessage.classList.add("is-hidden");

  if (guideMessageTimeoutId) {
    clearTimeout(guideMessageTimeoutId);
    guideMessageTimeoutId = null;
  }
}

function setCameraStatus(message, state = "default") {
  cameraStatus.textContent = message;
  cameraStatus.dataset.state = state;

  if (!message || state !== "error") {
    cameraStatus.classList.add("is-hidden");
    return;
  }

  cameraStatus.classList.remove("is-hidden");
}

function setActiveGuidedEarSide(side = TRY_ON_CONFIG.visibleEarSide) {
  activeGuidedEarSide = side;

  applyGuidedEarTargetToElement(
    cameraView,
    TRY_ON_CONFIG,
    activeGuidedEarSide,
  );
}

function stopGuideTracking() {
  if (!guideTrackingFrameId) return;

  cancelAnimationFrame(guideTrackingFrameId);
  guideTrackingFrameId = null;
}

function startGuideTracking() {
  stopGuideTracking();

  const trackGuide = (timestamp) => {
    const shouldTrackGuide =
      cameraController.isActive && cameraGuide.classList.contains("is-visible");

    if (!shouldTrackGuide) {
      guideTrackingFrameId = null;
      return;
    }

    if (timestamp - lastGuideTrackingTime >= GUIDE_TRACKING_INTERVAL) {
      lastGuideTrackingTime = timestamp;

      try {
        const analysis = faceAnalyzer.analyzeImage(cameraVideo);

        if (analysis.hasFace) {
          const detectedSide = detectGuidedEarSide(
            analysis.landmarks,
            activeGuidedEarSide,
          );

          setActiveGuidedEarSide(detectedSide);
        }
      } catch (error) {
        // Some preview frames may not be ready; keep the UI responsive.
      }
    }

    guideTrackingFrameId = requestAnimationFrame(trackGuide);
  };

  guideTrackingFrameId = requestAnimationFrame(trackGuide);
}
function showCameraLoading() {
  cameraLoading.classList.remove("is-hidden");
}

function hideCameraLoading() {
  cameraLoading.classList.add("is-hidden");
}

function showCameraPlaceholder() {
  cameraPlaceholder.classList.remove("is-hidden");
}

function hideCameraPlaceholder() {
  cameraPlaceholder.classList.add("is-hidden");
}



function showDebugCanvas() {
  debugCanvas.classList.add("is-visible");
}

function hideDebugCanvas() {
  debugCanvas.classList.remove("is-visible");
  landmarkDebugRenderer.clear();
}

function showEarringCanvas() {
  earringCanvas.classList.add("is-visible");
}

function hideEarringCanvas() {
  earringCanvas.classList.remove("is-visible");
  earringRenderer.clear();
}

function showLiveCameraState() {
  cameraView.classList.remove("has-capture");
  captureCanvas.classList.remove("is-visible");
  cameraGuide.classList.add("is-visible");

  showGuideMessage();

  setModalState("live");
  setActiveGuidedEarSide(TRY_ON_CONFIG.visibleEarSide);
  startGuideTracking();

  hideDebugCanvas();
  hideEarringCanvas();

  startCameraButton.classList.add("is-hidden");
  capturePhotoButton.classList.remove("is-hidden");
  retakePhotoButton.classList.add("is-hidden");
}

function showCapturePhotoState() {
  cameraView.classList.add("has-capture");
  captureCanvas.classList.add("is-visible");
  cameraGuide.classList.remove("is-visible");

  hideGuideMessage();

  setModalState("captured");
  stopGuideTracking();

  startCameraButton.classList.add("is-hidden");
  capturePhotoButton.classList.add("is-hidden");
  retakePhotoButton.classList.remove("is-hidden");
}

function resetCaptureState() {
  lastCaptureData = null;

  stopGuideTracking();
  setActiveGuidedEarSide(TRY_ON_CONFIG.visibleEarSide);
  setModalState("idle");

  cameraView.classList.remove("has-capture");
  captureCanvas.classList.remove("is-visible");
  cameraGuide.classList.remove("is-visible");

  hideDebugCanvas();
  hideEarringCanvas();

  startCameraButton.classList.remove("is-hidden");
  capturePhotoButton.classList.add("is-hidden");
  retakePhotoButton.classList.add("is-hidden");
}

function renderVariantSelector() {
  variantSelector.innerHTML = earringVariants
    .map((variant) => {
      const isSelected = variant.id === selectedEarringVariant.id;

      return `
        <button
          class="variant-selector__item${isSelected ? " is-selected" : ""}"
          type="button"
          data-variant-id="${variant.id}"
          aria-label="Select ${variant.name}"
          aria-pressed="${isSelected}"
        >
        <img
  src="${variant.imageUrl}"
  alt=""
  class="variant-selector__image"
  style="--variant-thumbnail-scale: ${variant.thumbnailScale ?? 1};"
/>
        </button>
      `;
    })
    .join("");
}

function getVariantById(variantId) {
  return earringVariants.find((variant) => variant.id === variantId) ?? null;
}

async function renderSelectedEarringOnCapture() {
  if (!lastCaptureData) return;

  const { capture, visibleEarAnchor, visibleEarSide, faceWidth } =
    lastCaptureData;

  earringRenderer.resize(capture.width, capture.height);
  earringRenderer.clear();

  await earringRenderer.drawEarring(
    visibleEarAnchor,
    selectedEarringVariant,
    {
      faceWidth,
      side: visibleEarSide,
    },
  );

  showEarringCanvas();
}

function openCameraModal() {
  
  cameraModal.classList.add("is-open");
  cameraModal.setAttribute("aria-hidden", "false");

  showCameraLoading();

  setModalState("idle");
  setCameraStatus("");
  document.body.classList.add("modal-open");
}

function closeCameraModal() {
  hideCameraLoading();
  cameraController.stop();
  showCameraPlaceholder();
  resetCaptureState();

  startCameraButton.disabled = false;
  startCameraButton.textContent = "Enable camera";

  cameraModal.classList.remove("is-open");
  cameraModal.setAttribute("aria-hidden", "true");

  setModalState("idle");
  setCameraStatus("");
  document.body.classList.remove("modal-open");
}

async function startCamera() {
  try {
    showCameraLoading();
    startCameraButton.disabled = true;
    startCameraButton.textContent = "Starting...";

    setCameraStatus("Requesting camera access...");

    await cameraController.start();

    setCameraStatus("Preparing face tracking...");

    await faceAnalyzer.initialize();

    hideCameraPlaceholder();
    showLiveCameraState();
hideCameraLoading();
    startCameraButton.textContent = "Camera ready";

    setCameraStatus(
      "Align your earlobe with the guide and use good lighting.",
      "success",
    );
  } catch (error) {
    console.error(error);
hideCameraLoading();
    cameraController.stop();
    showCameraPlaceholder();

    startCameraButton.disabled = false;
    startCameraButton.textContent = "Enable camera";

    if (error.name === "NotAllowedError") {
      setCameraStatus(
        "Camera access was denied. Check your browser permissions.",
        "error",
      );

      return;
    }

    if (error.message === "MEDIA_DEVICES_UNSUPPORTED") {
      setCameraStatus(
        "This browser cannot access the camera on this page.",
        "error",
      );

      return;
    }

    setCameraStatus(
      "Couldn't start the camera. Try another browser or device.",
      "error",
    );
  }
}

async function capturePhoto() {
  if (!cameraController.isActive) {
    setCameraStatus("Enable the camera before taking a photo.", "error");
    return;
  }

  try {
    const capture = photoCapture.captureMirroredFrame();
    const analysis = faceAnalyzer.analyzeImage(capture.canvas);


    showCapturePhotoState();
    landmarkDebugRenderer.resize(capture.width, capture.height);

    if (!analysis.hasFace) {
      hideDebugCanvas();
      hideEarringCanvas();

      setCameraStatus(
        "No face detected. Retake the photo in better lighting.",
        "error",
      );

      return;
    }

    if (TRY_ON_CONFIG.validatePoseQuality) {
      const poseQuality = evaluatePoseQuality(analysis.landmarks, {
        visibleEarSide: activeGuidedEarSide,
      });


      if (!poseQuality.isValid) {
        hideDebugCanvas();
        hideEarringCanvas();

        setCameraStatus(poseQuality.message, "error");
        return;
      }
    }

    const leftOuter = analysis.landmarks[234];
    const rightOuter = analysis.landmarks[454];
    const faceWidth = Math.abs(rightOuter.x - leftOuter.x);
const estimatedEarAnchors = estimateEarAnchors(analysis.landmarks);

const detectedCaptureEarSide =
  TRY_ON_CONFIG.anchorMode === "guided-target"
    ? detectGuidedEarSide(analysis.landmarks, activeGuidedEarSide)
    : TRY_ON_CONFIG.visibleEarSide;

const visibleEarSide =
  TRY_ON_CONFIG.anchorMode === "guided-target"
    ? detectedCaptureEarSide === "right"
      ? "left"
      : "right"
    : detectedCaptureEarSide;

setActiveGuidedEarSide(visibleEarSide);

const estimatedEarAnchor = estimatedEarAnchors[visibleEarSide];

const guidedEarAnchor = getGuidedEarAnchor(
  TRY_ON_CONFIG,
  visibleEarSide,
);

const visibleEarAnchor =
  TRY_ON_CONFIG.anchorMode === "guided-target"
    ? guidedEarAnchor
    : estimatedEarAnchor;

    if (!visibleEarAnchor) {
      setCameraStatus(
        "Couldn't determine the earring position. Please retake the photo.",
        "error",
      );

      return;
    }



    if (TRY_ON_CONFIG.debugMode) {
      landmarkDebugRenderer.drawLandmarks(analysis.landmarks, {
        selectedIndexes: EAR_DEBUG_LANDMARK_INDEXES,
        selectedColor: "rgba(255, 40, 40, 1)",
        selectedRadius: 7,
      });

      landmarkDebugRenderer.drawPoint(visibleEarAnchor, {
        radius: 9,
        color: "rgba(0, 140, 255, 1)",
      });

      showDebugCanvas();
    } else {
      hideDebugCanvas();
    }

    earringRenderer.resize(capture.width, capture.height);
    earringRenderer.clear();

    lastCaptureData = {
      capture,
      visibleEarAnchor,
      visibleEarSide,
      faceWidth,
    };

    await renderSelectedEarringOnCapture();

    setCameraStatus(
      "Earring placed. Retake the photo to try the other ear or a different position.",
      "success",
    );
  } catch (error) {
    if (error.message === "VIDEO_NOT_READY") {
      setCameraStatus(
        "The camera isn't ready yet. Please try again.",
        "error",
      );

      return;
    }

    if (error.message === "FACE_ANALYZER_NOT_READY") {
      setCameraStatus(
        "Face tracking isn't ready yet. Please try again shortly.",
        "error",
      );

      return;
    }

    console.error(error);

    setCameraStatus(
      "Couldn't take the photo. Please try again.",
      "error",
    );
  }
}

function retakePhoto() {
  if (!cameraController.isActive) {
    resetCaptureState();
    showCameraPlaceholder();
    setCameraStatus("");
    return;
  }

lastCaptureData = null;

photoCapture.clear();
earringRenderer.clear();

hideCameraPlaceholder();
showLiveCameraState();

  setCameraStatus(
    "Align your earlobe with the guide and use good lighting.",
    "success",
  );
}

renderVariantSelector();

openCameraButton.addEventListener("click", async () => {
  openCameraModal();
  await startCamera();
});

startCameraButton.addEventListener("click", () => {
  startCamera();
});

capturePhotoButton.addEventListener("click", () => {
  capturePhoto();
});

retakePhotoButton.addEventListener("click", () => {
  retakePhoto();
});

closeCameraButton.addEventListener("click", () => {
  closeCameraModal();
});


cameraModal.addEventListener("click", (event) => {
  if (event.target === cameraModal) {
    closeCameraModal();
  }
});

poseGuideDismiss.addEventListener("click", () => {
  hideGuideMessage();
});

variantSelector.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-variant-id]");

  if (!button) return;

  const variant = getVariantById(button.dataset.variantId);

  if (!variant) return;

  selectedEarringVariant = variant;

  renderVariantSelector();

  await renderSelectedEarringOnCapture();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && cameraModal.classList.contains("is-open")) {
    closeCameraModal();
  }
});