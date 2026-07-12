import "./style.css";

document.querySelector("#app").innerHTML = `
  <main class="app">
    <section class="product-preview">
      <div class="product-preview__content">
        <p class="eyebrow">Virtual try-on</p>

        <h1>Prueba tus pendientes</h1>

        <p class="product-preview__description">
          Utiliza la cámara frontal para visualizar cómo queda el pendiente.
          La cámara solo se activará cuando pulses el botón.
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
          Pulsa «Activar cámara» para comenzar.
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
            Cancelar
          </button>
        </footer>
      </div>
    </section>
  </main>
`;