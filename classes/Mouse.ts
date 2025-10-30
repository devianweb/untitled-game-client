import * as THREE from "three";

export default class Mouse {
  canvas: HTMLCanvasElement;
  camera: THREE.Camera;
  worldPoint: THREE.Vector3;
  ndc: THREE.Vector2;

  constructor(canvas: HTMLCanvasElement, camera: THREE.Camera) {
    this.canvas = canvas;
    this.worldPoint = new THREE.Vector3();
    this.camera = camera;
    this.ndc = new THREE.Vector2();

    this.canvas.addEventListener("mousemove", (e) => this.onMouseMove(e));
  }

  onMouseMove = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();

    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    this.ndc.set(x * 2 - 1, -(y * 2 - 1));

    this.updateWorldPoint();
  };

  updateWorldPoint = () => {
    this.worldPoint.set(this.ndc.x, this.ndc.y, -0.5);
    this.worldPoint.unproject(this.camera);
  };
}
