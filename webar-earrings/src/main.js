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

        <h1>Prueba tus pendientes</h1>

        <p class="product-preview__description">
          Utiliza la cámara frontal para visualizar cómo queda el pendiente.
          Para ver mejor los detalles, busca un espacio bien iluminado.
        </p>

        <button
          id="open-camera-button"
          class="button button--primary"
          type="button"
        >
          Probar pendiente
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
            <h2 id="camera-modal-title">Prueba virtual</h2>
          </div>

          <button
            id="close-camera-button"
            class="icon-button"
            type="button"
            aria-label="Cerrar cámara"
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

              <p class="pose-guide__label">
                Alinea el lóbulo con el punto
              </p>
            </div>
          </div>

          <div
            id="camera-placeholder"
            class="camera-view__placeholder"
          >
            <p>Activa la cámara para comenzar</p>
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
          aria-label="Seleccionar pendiente"
        ></div>

        <footer class="camera-modal__footer">
          <button
            id="start-camera-button"
            class="button button--primary"
            type="button"
          >
            Activar cámara
          </button>

          <button
            id="capture-photo-button"
            class="button button--primary is-hidden"
            type="button"
          >
            Hacer foto
          </button>

          <button
            id="retake-photo-button"
            class="button button--primary is-hidden"
            type="button"
          >
            Repetir
          </button>

          <button
            id="cancel-camera-button"
            class="button button--secondary"
            type="button"
          >
            Cerrar
          </button>
        </footer>
      </div>
    </section>
  </main>
`;

const openCameraButton = document.querySelector("#open-camera-button");
const closeCameraButton = document.querySelector("#close-camera-button");
const cancelCameraButton = document.querySelector("#cancel-camera-button");
const startCameraButton = document.querySelector("#start-camera-button");
const capturePhotoButton = document.querySelector("#capture-photo-button");
const retakePhotoButton = document.querySelector("#retake-photo-button");

const cameraModal = document.querySelector("#camera-modal");
const cameraStatus = document.querySelector("#camera-status");
const cameraVideo = document.querySelector("#camera-video");
const cameraPlaceholder = document.querySelector("#camera-placeholder");
const cameraView = document.querySelector(".camera-view");
const cameraGuide = document.querySelector("#camera-guide");

const captureCanvas = document.querySelector("#capture-canvas");
const debugCanvas = document.querySelector("#debug-canvas");
const earringCanvas = document.querySelector("#earring-canvas");
const variantSelector = document.querySelector("#variant-selector");

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

const GUIDE_TRACKING_INTERVAL = 180;

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
        // Durante el preview puede haber frames no listos. No bloqueamos la UX.
      }
    }

    guideTrackingFrameId = requestAnimationFrame(trackGuide);
  };

  guideTrackingFrameId = requestAnimationFrame(trackGuide);
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

  stopGuideTracking();

  startCameraButton.classList.add("is-hidden");
  capturePhotoButton.classList.add("is-hidden");
  retakePhotoButton.classList.remove("is-hidden");
}

function resetCaptureState() {
  lastCaptureData = null;

  stopGuideTracking();
  setActiveGuidedEarSide(TRY_ON_CONFIG.visibleEarSide);

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
          aria-label="Seleccionar ${variant.name}"
          aria-pressed="${isSelected}"
        >
          <img
            src="${variant.imageUrl}"
            alt=""
            class="variant-selector__image"
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

  setCameraStatus("");
  document.body.classList.add("modal-open");
}

function closeCameraModal() {
  cameraController.stop();
  showCameraPlaceholder();
  resetCaptureState();

  startCameraButton.disabled = false;
  startCameraButton.textContent = "Activar cámara";

  cameraModal.classList.remove("is-open");
  cameraModal.setAttribute("aria-hidden", "true");

  setCameraStatus("");
  document.body.classList.remove("modal-open");
}

async function startCamera() {
  try {
    startCameraButton.disabled = true;
    startCameraButton.textContent = "Activando...";

    setCameraStatus("Solicitando acceso a la cámara...");

    await cameraController.start();

    setCameraStatus("Preparando análisis facial...");

    await faceAnalyzer.initialize();

    hideCameraPlaceholder();
    showLiveCameraState();

    startCameraButton.textContent = "Cámara activa";

    setCameraStatus(
      "Alinea el lóbulo con el punto y busca buena iluminación.",
      "success",
    );
  } catch (error) {
    console.error(error);

    cameraController.stop();
    showCameraPlaceholder();

    startCameraButton.disabled = false;
    startCameraButton.textContent = "Activar cámara";

    if (error.name === "NotAllowedError") {
      setCameraStatus(
        "No has permitido el acceso a la cámara. Revisa los permisos del navegador.",
        "error",
      );

      return;
    }

    if (error.message === "MEDIA_DEVICES_UNSUPPORTED") {
      setCameraStatus(
        "Este navegador no permite acceder a la cámara desde esta página.",
        "error",
      );

      return;
    }

    setCameraStatus(
      "No se ha podido activar la cámara. Prueba con otro navegador o dispositivo.",
      "error",
    );
  }
}

async function capturePhoto() {
  if (!cameraController.isActive) {
    setCameraStatus("Activa la cámara antes de hacer la foto.", "error");
    return;
  }

  try {
    const capture = photoCapture.captureMirroredFrame();
    const analysis = faceAnalyzer.analyzeImage(capture.canvas);

    console.log("Face analysis:", analysis);

    showCapturePhotoState();
    landmarkDebugRenderer.resize(capture.width, capture.height);

    if (!analysis.hasFace) {
      hideDebugCanvas();
      hideEarringCanvas();

      setCameraStatus(
        "No se ha detectado ningún rostro. Repite la foto con más luz.",
        "error",
      );

      return;
    }

    if (TRY_ON_CONFIG.validatePoseQuality) {
      const poseQuality = evaluatePoseQuality(analysis.landmarks, {
        visibleEarSide: activeGuidedEarSide,
      });

      console.log("Pose quality:", poseQuality);

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

const visibleEarSide =
  TRY_ON_CONFIG.anchorMode === "guided-target"
    ? activeGuidedEarSide
    : TRY_ON_CONFIG.visibleEarSide;

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
        "No se ha podido calcular la posición del pendiente. Repite la foto.",
        "error",
      );

      return;
    }

    setActiveGuidedEarSide(visibleEarSide);

    console.log("Estimated ear anchors:", estimatedEarAnchors);
    console.log("Visible ear side:", visibleEarSide);
    console.log("Guided ear anchor:", guidedEarAnchor);
    console.log("Visible ear anchor:", visibleEarAnchor);
    console.log("Face width:", faceWidth);

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
      "Pendiente colocado. Puedes repetir la foto si quieres probar la otra oreja o una nueva posición.",
      "success",
    );
  } catch (error) {
    if (error.message === "VIDEO_NOT_READY") {
      setCameraStatus(
        "La cámara todavía no está lista. Inténtalo de nuevo.",
        "error",
      );

      return;
    }

    if (error.message === "FACE_ANALYZER_NOT_READY") {
      setCameraStatus(
        "El análisis facial todavía no está listo. Espera un momento e inténtalo de nuevo.",
        "error",
      );

      return;
    }

    console.error(error);

    setCameraStatus(
      "No se ha podido capturar la foto. Inténtalo de nuevo.",
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

  photoCapture.clear();

  hideCameraPlaceholder();
  showLiveCameraState();

  setCameraStatus(
    "Alinea el lóbulo con el punto y busca buena iluminación.",
    "success",
  );
}

renderVariantSelector();

openCameraButton.addEventListener("click", () => {
  openCameraModal();
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

cancelCameraButton.addEventListener("click", () => {
  closeCameraModal();
});

cameraModal.addEventListener("click", (event) => {
  if (event.target === cameraModal) {
    closeCameraModal();
  }
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