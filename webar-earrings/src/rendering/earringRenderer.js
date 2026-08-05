function resolveVariantSettings(variant, side) {
  const sideAdjustment = variant.sideAdjustments?.[side] ?? {};

  return {
    anchor: sideAdjustment.anchor ?? variant.anchor ?? { x: 0.5, y: 0.5 },
    scale: sideAdjustment.scale ?? variant.scale ?? 0.1,
    rotation: sideAdjustment.rotation ?? variant.rotation ?? 0,
  };
}

function resolveVariantLayers(variant) {
  if (Array.isArray(variant.layers) && variant.layers.length > 0) {
    return variant.layers;
  }

  // Fallback para pendientes normales: stud, cadena, etc.
  // Esto está bien mantenerlo. Solo se usa cuando una variante NO tiene layers.
  return [
    {
      id: "base",
      type: "image",
      imageUrl: variant.imageUrl,
      opacity: 1,
      offset: { x: 0, y: 0 },
    },
  ];
}

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

  getLayerMetrics(anchorPoint, image, settings, layer, options = {}) {
    const { faceWidth = 0.4 } = options;

    const canvasWidth = this.canvasElement.width;
    const canvasHeight = this.canvasElement.height;

    const anchorX = anchorPoint.x * canvasWidth;
    const anchorY = anchorPoint.y * canvasHeight;

    const targetWidth =
      faceWidth * canvasWidth * settings.scale * (layer.scaleMultiplier ?? 1);

    const imageRatio = image.height / image.width;
    const targetHeight = targetWidth * imageRatio;

    const layerAnchor = layer.anchor ?? settings.anchor;

    const imageAnchorX = layerAnchor.x * targetWidth;
    const imageAnchorY = layerAnchor.y * targetHeight;

    const layerOffsetX = (layer.offset?.x ?? 0) * targetWidth;
    const layerOffsetY = (layer.offset?.y ?? 0) * targetHeight;

    return {
      anchorX,
      anchorY,
      targetWidth,
      targetHeight,
      imageAnchorX,
      imageAnchorY,
      layerOffsetX,
      layerOffsetY,
    };
  }

  drawImageLayer(anchorPoint, image, settings, layer, options = {}) {
    const { side = "right" } = options;

    const {
      anchorX,
      anchorY,
      targetWidth,
      targetHeight,
      imageAnchorX,
      imageAnchorY,
      layerOffsetX,
      layerOffsetY,
    } = this.getLayerMetrics(anchorPoint, image, settings, layer, options);

    this.context.save();

    this.context.translate(anchorX, anchorY);

    if (side === "left") {
      this.context.scale(-1, 1);
    }

    this.context.rotate(settings.rotation + (layer.rotation ?? 0));
    this.context.translate(layerOffsetX, layerOffsetY);

    this.context.globalAlpha = layer.opacity ?? 1;

    this.context.drawImage(
      image,
      -imageAnchorX,
      -imageAnchorY,
      targetWidth,
      targetHeight,
    );

    this.context.restore();
  }

  drawEraseLayer(anchorPoint, settings, layer, options = {}) {
    const { faceWidth = 0.4, side = "right" } = options;

    const canvasWidth = this.canvasElement.width;

    const anchorX = anchorPoint.x * this.canvasElement.width;
    const anchorY = anchorPoint.y * this.canvasElement.height;

    const baseSize = faceWidth * canvasWidth * settings.scale;

    const eraseWidth = baseSize * (layer.widthMultiplier ?? 0.26);
    const eraseHeight = baseSize * (layer.heightMultiplier ?? 0.38);

    const eraseOffsetX = baseSize * (layer.offset?.x ?? 0);
    const eraseOffsetY = baseSize * (layer.offset?.y ?? 0);

    this.context.save();

    this.context.translate(anchorX, anchorY);

    if (side === "left") {
      this.context.scale(-1, 1);
    }

    this.context.rotate(settings.rotation + (layer.rotation ?? 0));
    this.context.translate(eraseOffsetX, eraseOffsetY);

    this.context.globalCompositeOperation = "destination-out";

    this.context.beginPath();
    this.context.ellipse(
      0,
      0,
      eraseWidth,
      eraseHeight,
      0,
      0,
      Math.PI * 2,
    );
    this.context.fill();

    this.context.restore();

    this.context.globalCompositeOperation = "source-over";
  }

  async drawEarring(anchorPoint, variant, options = {}) {
    if (!anchorPoint || !variant) {
      return;
    }

    const { side = "right" } = options;

    const settings = resolveVariantSettings(variant, side);
    const layers = resolveVariantLayers(variant);

    for (const layer of layers) {
      if (layer.type === "erase") {
        this.drawEraseLayer(anchorPoint, settings, layer, options);
        continue;
      }

      const image = await this.loadImage(layer.imageUrl ?? variant.imageUrl);

      this.drawImageLayer(anchorPoint, image, settings, layer, options);
    }
  }
}