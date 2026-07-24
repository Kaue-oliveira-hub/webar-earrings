export class EarringRenderer {
  constructor(canvasElement) {
    if (!(canvasElement instanceof HTMLCanvasElement)) {
      throw new TypeError(
        "EarringRenderer necesita un elemento HTMLCanvasElement válido.",
      );
    }

    this.canvasElement = canvasElement;
    this.context = canvasElement.getContext("2d");
    this.imageCache = new Map();
  }

  resize(width, height) {
    this.canvasElement.width = width;
    this.canvasElement.height = height;
  }

  clear() {
    this.context.clearRect(
      0,
      0,
      this.canvasElement.width,
      this.canvasElement.height,
    );
  }

  async loadImage(imageUrl) {
    if (this.imageCache.has(imageUrl)) {
      return this.imageCache.get(imageUrl);
    }

    const image = new Image();
    image.src = imageUrl;

    await image.decode();

    this.imageCache.set(imageUrl, image);

    return image;
  }

  async drawEarring(anchorPoint, variant, options = {}) {
    if (!anchorPoint || !variant) {
      return;
    }

    const {
      faceWidth = 0.4,
      side = "right",
    } = options;

    const image = await this.loadImage(variant.imageUrl);

    const canvasWidth = this.canvasElement.width;
    const canvasHeight = this.canvasElement.height;

    const anchorX = anchorPoint.x * canvasWidth;
    const anchorY = anchorPoint.y * canvasHeight;

    const targetWidth = faceWidth * canvasWidth * variant.scale;
    const imageRatio = image.height / image.width;
    const targetHeight = targetWidth * imageRatio;

    const imageAnchorX = variant.anchor.x * targetWidth;
    const imageAnchorY = variant.anchor.y * targetHeight;

    this.context.save();

    this.context.translate(anchorX, anchorY);

    if (side === "left") {
      this.context.scale(-1, 1);
    }

    this.context.rotate(variant.rotation);

    this.context.drawImage(
      image,
      -imageAnchorX,
      -imageAnchorY,
      targetWidth,
      targetHeight,
    );

    this.context.restore();
  }
}