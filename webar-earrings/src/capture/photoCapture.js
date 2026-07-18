export class PhotoCapture {
  constructor(videoElement, canvasElement) {
    if (!(videoElement instanceof HTMLVideoElement)) {
      throw new TypeError(
        "PhotoCapture necesita un elemento HTMLVideoElement válido.",
      );
    }

    if (!(canvasElement instanceof HTMLCanvasElement)) {
      throw new TypeError(
        "PhotoCapture necesita un elemento HTMLCanvasElement válido.",
      );
    }

    this.videoElement = videoElement;
    this.canvasElement = canvasElement;
    this.context = canvasElement.getContext("2d");
  }

  getVideoSize() {
    return {
      width: this.videoElement.videoWidth,
      height: this.videoElement.videoHeight,
    };
  }

  isVideoReady() {
    const { width, height } = this.getVideoSize();

    return width > 0 && height > 0;
  }

  captureMirroredFrame() {
    if (!this.isVideoReady()) {
      throw new Error("VIDEO_NOT_READY");
    }

    const { width, height } = this.getVideoSize();

    this.canvasElement.width = width;
    this.canvasElement.height = height;

    this.context.save();

    this.context.translate(width, 0);
    this.context.scale(-1, 1);

    this.context.drawImage(this.videoElement, 0, 0, width, height);

    this.context.restore();

    return {
      width,
      height,
      canvas: this.canvasElement,
    };
  }

  clear() {
    this.context.clearRect(
      0,
      0,
      this.canvasElement.width,
      this.canvasElement.height,
    );
  }
}