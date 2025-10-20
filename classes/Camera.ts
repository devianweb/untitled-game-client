import * as THREE from "three";
import Player from "./Player";

export default class Camera {
  camera: THREE.OrthographicCamera;
  left: number;
  right: number;
  top: number;
  bottom: number;
  canvas: HTMLCanvasElement;
  aspect: number;
  frustumSize: number = 10;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.aspect = this.calculateAspect();
    this.left = this.calculateLeft();
    this.right = this.calculateRight();
    this.top = this.calculateTop();
    this.bottom = this.calculateBottom();
    this.camera = this.createCamera();

    // Window resize
    window.addEventListener("resize", () => this.updateCameraOnResize());
  }

  createCamera = (): THREE.OrthographicCamera => {
    const camera = new THREE.OrthographicCamera(
      this.left,
      this.right,
      this.top,
      this.bottom,
      0.1,
      1000
    );
    camera.position.z = 5;
    return camera;
  };

  updateCameraOnResize = (): void => {
    this.aspect = this.calculateAspect();
    this.left = this.calculateLeft();
    this.right = this.calculateRight();
    this.camera.left = this.left;
    this.camera.right = this.right;
    this.camera.updateProjectionMatrix();
  };

  updateCameraPosition = (player: Player): void => {
    if (this.camera.position.x !== player.position.x) {
      const diffX = player.position.x - this.camera.position.x;
      this.camera.position.x += 0.1 * diffX;
    }

    if (this.camera.position.y !== player.position.y) {
      const diffY = player.position.y - this.camera.position.y;
      this.camera.position.y += 0.1 * diffY;
    }
  };

  calculateAspect = (): number => {
    return this.canvas.clientWidth / this.canvas.clientHeight;
  };

  calculateLeft = (): number => {
    return (this.frustumSize * this.aspect) / -2;
  };

  calculateRight = (): number => {
    return (this.frustumSize * this.aspect) / 2;
  };

  calculateTop = (): number => {
    return this.frustumSize / 2;
  };

  calculateBottom = (): number => {
    return this.frustumSize / -2;
  };
}
