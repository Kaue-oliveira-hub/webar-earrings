import "./style.css";
import { CameraController } from "./camera/cameraController.js";


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

          <div
            id="camera-placeholder"
            class="camera-view__placeholder"
          >
            <p>La cámara todavía no está activa.</p>
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

const cameraModal = document.querySelector("#camera-modal");
const cameraStatus = document.querySelector("#camera-status");
const cameraVideo = document.querySelector("#camera-video");
const cameraPlaceholder = document.querySelector("#camera-placeholder");

const cameraController = new CameraController(cameraVideo);


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


function openCameraModal() {
  cameraModal.classList.add("is-open");
  cameraModal.setAttribute("aria-hidden", "false");

    setCameraStatus("");
}

function closeCameraModal() {
  cameraController.stop();
  showCameraPlaceholder();

  startCameraButton.disabled = false;
  startCameraButton.textContent = "Activar cámara";

  cameraModal.classList.remove("is-open");
  cameraModal.setAttribute("aria-hidden", "true");

  setCameraStatus("");
}

async function startCamera() {
  try {
    startCameraButton.disabled = true;
    startCameraButton.textContent = "Activando...";

    setCameraStatus("Solicitando acceso a la cámara...");

    await cameraController.start();

    hideCameraPlaceholder();

    startCameraButton.textContent = "Cámara activa";
    setCameraStatus("Cámara activa.", "success");
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



openCameraButton.addEventListener("click", () => {
  openCameraModal();
});

startCameraButton.addEventListener("click", () => {
  startCamera();
});

closeCameraButton.addEventListener("click", () => {
  closeCameraModal();
});

cancelCameraButton.addEventListener("click", () => {
  closeCameraModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && cameraModal.classList.contains("is-open")) {
    closeCameraModal();
  }
});