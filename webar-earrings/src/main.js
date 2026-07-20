import "./style.css";
import { CameraController } from "./camera/cameraController.js";
import { PhotoCapture } from "./capture/photoCapture.js";
import { FaceAnalyzer } from "./tracking/faceAnalyzer.js";
import { LandmarkDebugRenderer } from "./rendering/landmarkDebugRenderer.js";
import { EAR_DEBUG_LANDMARK_INDEXES } from "./tracking/faceLandmarkIndexes.js";
import { estimateEarAnchors } from "./tracking/earEstimator.js";

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
            <p class="eyebrow">Prueba virtual</p>
            <h2 id="camera-modal-title">Coloca tu rostro en pantalla</h2>
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

          <div
            id="camera-guide"
            class="camera-view__guide"
            aria-hidden="true"
            >
            <div class="face-guide">
              <span class="face-guide__ear"></span>
            </div>
          </div>

          <div
            id="camera-placeholder"
            class="camera-view__placeholder"
          >
            <p>Activa la cámara para comenzar </p>
          </div>
        </div>

        <div
          id="camera-status"
          class="camera-status"
          role="status"
          aria-live="polite"
        >
        </div>

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
            Repetir foto
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

const cameraController = new CameraController(cameraVideo);
const photoCapture = new PhotoCapture(cameraVideo, captureCanvas);
const faceAnalyzer = new FaceAnalyzer();
const landmarkDebugRenderer = new LandmarkDebugRenderer(debugCanvas);


function setCameraStatus(message, state = "default") {
  cameraStatus.textContent = message;
  cameraStatus.dataset.state = state;
}
function showCameraPlaceholder() {
  cameraPlaceholder.classList.remove("is-hidden");
}
function hideCameraPlaceholder() {
  cameraPlaceholder.classList.add("is-hidden");
}

function showLiveCameraState() {
  cameraView.classList.remove("has-capture");
  captureCanvas.classList.remove("is-visible");
  cameraGuide.classList.add("is-visible");

hideDebugCanvas();

  startCameraButton.classList.add("is-hidden");
  capturePhotoButton.classList.remove("is-hidden");
  retakePhotoButton.classList.add("is-hidden");
}

function showCapturePhotoState() {
  cameraView.classList.add("has-capture");
  captureCanvas.classList.add("is-visible");
  cameraGuide.classList.remove("is-visible");

  startCameraButton.classList.add("is-hidden");
  capturePhotoButton.classList.add("is-hidden");
  retakePhotoButton.classList.remove("is-hidden");
}

function showDebugCanvas() {
  debugCanvas.classList.add("is-visible");
}

function hideDebugCanvas() {
  debugCanvas.classList.remove("is-visible");
  landmarkDebugRenderer.clear();
}


function resetCaptureState() {
cameraView.classList.remove("has-capture");
  captureCanvas.classList.remove("is-visible");
  cameraGuide.classList.remove("is-visible");

 hideDebugCanvas();

startCameraButton.classList.remove("is-hidden");
  capturePhotoButton.classList.add("is-hidden");
  retakePhotoButton.classList.add("is-hidden");

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

    setCameraStatus("Coloca tu rostro dentro de la guía y busca buena iluminación.", "success");
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

function capturePhoto() {
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

    setCameraStatus(
      "No se ha detectado ningún rostro. Repite la foto con más luz y el rostro dentro de la guía.",
      "error",
    );

    return;
  }
  const earAnchors = estimateEarAnchors(analysis.landmarks);

console.log("Estimated ear anchors:", earAnchors);

    landmarkDebugRenderer.drawLandmarks(analysis.landmarks, { 
      selectedIndexes: EAR_DEBUG_LANDMARK_INDEXES,
      selectedColor: "rgb(255, 92, 11)",
      selectedRadius:7,
    });
landmarkDebugRenderer.drawPoint(earAnchors.left);
landmarkDebugRenderer.drawPoint(earAnchors.right);

    showDebugCanvas();
    
    setCameraStatus(
     `Rostro detectado con ${analysis.landmarks.length} landmarks. Los puntos rojos son referencias laterales para estimar la oreja.`,
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
    "Coloca tu rostro dentro de la guía y busca buena iluminación.",
    "success",
  );
}




document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && cameraModal.classList.contains("is-open")) {
    closeCameraModal();
  }
});