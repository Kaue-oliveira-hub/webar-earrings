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
    throw new Error("El método start() todavía no está implementado.");
  }

  stop() {
    if (!this.stream) {
      return;
    }

    this.stream.getTracks().forEach((track) => {
      track.stop();
    });

    this.videoElement.srcObject = null;
    this.stream = null;
  }

  get isActive() {
    return this.stream !== null;
  }
}