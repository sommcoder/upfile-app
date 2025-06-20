import Konva from "konva";
console.log("Upfile image editor works");
class ImageEditorBlock {
    imageEl;
    containerEl;
    stage = null;
    layer = null;
    constructor(imageId, containerId) {
        const image = document.getElementById(imageId);
        const container = document.getElementById(containerId);
        if (!image || !container) {
            console.error("Image or container element not found");
            return;
        }
        this.imageEl = image;
        this.containerEl = container;
        this.init();
    }
    init() {
        // Wait for image to load before initializing Konva
        if (this.imageEl.complete) {
            this.setupCanvas();
        }
        else {
            this.imageEl.onload = () => this.setupCanvas();
        }
    }
    setupCanvas() {
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
    addDefaultText() {
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
    exportImage() {
        if (!this.stage)
            return null;
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
