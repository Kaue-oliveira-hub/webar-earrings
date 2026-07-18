export class LandmarkDebugRenderer {
  constructor(canvasElement) {
    if (!(canvasElement instanceof HTMLCanvasElement)) {
      throw new TypeError(
        "LandmarkDebugRenderer necesita un elemento HTMLCanvasElement válido.",
      );
    }

    this.canvasElement = canvasElement;
    this.context = canvasElement.getContext("2d");
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

  drawLandmarks(landmarks, options = {}) {
    const {
      radius = 2,
      color = "rgba(0, 255, 120, 0.95)",
      selectedIndexes = null,
      selectedColor = "rgba(255, 60, 60, 1)",
      selectedRadius = 5,
    } = options;

    if (!Array.isArray(landmarks)) {
      return;
    }

    this.clear();

    const width = this.canvasElement.width;
    const height = this.canvasElement.height;

    landmarks.forEach((landmark, index) => {
      const x = landmark.x * width;
      const y = landmark.y * height;

      const isSelected =
        Array.isArray(selectedIndexes) && selectedIndexes.includes(index);

      this.context.beginPath();
      this.context.arc(
        x,
        y,
        isSelected ? selectedRadius : radius,
        0,
        Math.PI * 2,
      );

      this.context.fillStyle = isSelected ? selectedColor : color;
      this.context.fill();
    });
  }
}