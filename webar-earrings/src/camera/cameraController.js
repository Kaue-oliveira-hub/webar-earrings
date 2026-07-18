export class CameraController {
  constructor(videoElement) {
    if (!(videoElement instanceof HTMLVideoElement)) {
      throw new TypeError(
        "CameraController necesita un elemento HTMLVideoElement válido.",
      );
    }

    this.videoElement = videoElement;
    this.stream = null;
  }

  async start() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Tu navegador no permite acceder a la cámara.");
    }

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: "user",
        width: {
          ideal: 1280,
        },
        height: {
          ideal: 720,
        },
      },
    });

    this.videoElement.srcObject = this.stream;

    await this.videoElement.play();

    return this.stream;
  }

  stop() {
    if (!this.stream) {
      return;
    }

    this.stream.getTracks().forEach((track) => {
      track.stop();
    });

    this.videoElement.pause();
    this.videoElement.srcObject = null;
    this.stream = null;
  }

  get isActive() {
    return this.stream !== null;
  }
}