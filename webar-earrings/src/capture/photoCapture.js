export class PhotoCapture {
  constructor(videoElement, canvasElement, viewElement) {
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

    if (!(viewElement instanceof HTMLElement)) {
      throw new TypeError(
        "PhotoCapture necesita el contenedor visible de la cámara.",
      );
    }

    this.videoElement = videoElement;
    this.canvasElement = canvasElement;
    this.viewElement = viewElement;
    this.context = canvasElement.getContext("2d");
  }

  captureMirroredFrame() {
    if (
      this.videoElement.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
      !this.videoElement.videoWidth ||
      !this.videoElement.videoHeight
    ) {
      throw new Error("VIDEO_NOT_READY");
    }

    const viewRect = this.viewElement.getBoundingClientRect();
    const pixelRatio = window.devicePixelRatio || 1;

    const canvasWidth = Math.round(viewRect.width * pixelRatio);
    const canvasHeight = Math.round(viewRect.height * pixelRatio);

    this.canvasElement.width = canvasWidth;
    this.canvasElement.height = canvasHeight;

    const videoWidth = this.videoElement.videoWidth;
    const videoHeight = this.videoElement.videoHeight;

    const videoRatio = videoWidth / videoHeight;
    const canvasRatio = canvasWidth / canvasHeight;

    let sourceWidth = videoWidth;
    let sourceHeight = videoHeight;
    let sourceX = 0;
    let sourceY = 0;

    if (videoRatio > canvasRatio) {
      sourceWidth = videoHeight * canvasRatio;
      sourceX = (videoWidth - sourceWidth) / 2;
    } else {
      sourceHeight = videoWidth / canvasRatio;
      sourceY = (videoHeight - sourceHeight) / 2;
    }

    this.context.save();

    this.context.clearRect(0, 0, canvasWidth, canvasHeight);

    this.context.translate(canvasWidth, 0);
    this.context.scale(-1, 1);

    this.context.drawImage(
      this.videoElement,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      canvasWidth,
      canvasHeight,
    );

    this.context.restore();

    return {
      canvas: this.canvasElement,
      width: canvasWidth,
      height: canvasHeight,
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