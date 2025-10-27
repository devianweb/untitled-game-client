import * as THREE from "three";

export default class Mouse {
  ndc: THREE.Vector2; // Normalized device coordinates (-1 to 1)
  screen: { x: number; y: number }; // Raw screen coordinates
  raycaster: THREE.Raycaster;
  camera: THREE.Camera;
  worldPoint: THREE.Vector3;

  constructor(canvas: HTMLCanvasElement, camera: THREE.Camera) {
    this.ndc = new THREE.Vector2();
    this.screen = { x: 0, y: 0 };
    this.raycaster = new THREE.Raycaster();
    this.worldPoint = new THREE.Vector3();
    this.camera = camera;

    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      this.screen.x = e.clientX;
      this.screen.y = e.clientY;

      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      this.ndc.x = x * 2 - 1;
      this.ndc.y = -(y * 2 - 1);
    });
  }

  update() {
    this.raycaster.setFromCamera(this.ndc, this.camera);
    this.worldPoint = this.raycaster.ray.origin.clone();
  }
}
