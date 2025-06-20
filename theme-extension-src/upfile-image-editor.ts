import Konva from "konva";

console.log("Upfile image editor works");

class ImageEditorBlock {
  private imageEl: HTMLImageElement;
  private containerEl: HTMLElement;
  private stage: Konva.Stage | null = null;
  private layer: Konva.Layer | null = null;

  constructor(imageId: string, containerId: string) {
    const image = document.getElementById(imageId) as HTMLImageElement;
    const container = document.getElementById(containerId) as HTMLElement;

    if (!image || !container) {
      console.error("Image or container element not found");
      return;
    }

    this.imageEl = image;
    this.containerEl = container;

    this.init();
  }

  private init() {
    // Wait for image to load before initializing Konva
    if (this.imageEl.complete) {
      this.setupCanvas();
    } else {
      this.imageEl.onload = () => this.setupCanvas();
    }
  }

  private setupCanvas() {
    const width = this.imageEl.clientWidth;
    const height = this.imageEl.clientHeight;

    // Match container size to image
    this.containerEl.style.width = `${width}px`;
    this.containerEl.style.height = `${height}px`;

    this.stage = new Konva.Stage({
      container: this.containerEl.id,
      width,
      height,
    });

    this.layer = new Konva.Layer();
    this.stage.add(this.layer);

    this.addDefaultText();
  }

  private addDefaultText() {
    const text = new Konva.Text({
      text: "Add Text Here",
      x: 50,
      y: 50,
      fontSize: 24,
      fontFamily: "Arial",
      fill: "red",
      draggable: true,
    });

    this.layer?.add(text);
    this.layer?.draw();
  }

  public exportImage(): string | null {
    if (!this.stage) return null;

    const dataURL = this.stage.toDataURL({ pixelRatio: 2 });

    // Example download trigger
    const link = document.createElement("a");
    link.download = "custom-image.png";
    link.href = dataURL;
    link.click();

    return dataURL;
  }
}

// Usage:
const editor = new ImageEditorBlock("product-image", "konva-container");
// Call `editor.exportImage()` when needed
