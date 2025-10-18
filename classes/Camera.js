import * as THREE from "three";

export default class Camera {
  camera;
  left;
  right;
  top;
  bottom;
  canvas;
  aspect;
  frustumSize = 10;

  constructor(canvas) {
    this.canvas = canvas;
    this.aspect = this.calculateAspect();
    this.left = this.calculateLeft();
    this.right = this.calculateRight();
    this.top = this.calculateTop();
    this.bottom = this.calculateBottom();
    this.camera = this.createCamera();

    document.defaultView.addEventListener("resize", (e) =>
      this.updateCameraOnResize()
    );
  }

  createCamera = () => {
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

  updateCameraOnResize = () => {
    console.log("happening!");
    this.aspect = this.calculateAspect();
    this.left = this.calculateLeft();
    this.right = this.calculateRight();
    this.camera.left = this.left;
    this.camera.right = this.right;
    this.camera.updateProjectionMatrix();
  };

  updateCameraPosition = (player) => {
    if (this.camera.position.x !== player.x) {
      const diff = player.x - this.camera.position.x;
      this.camera.position.x += 0.1 * diff;
    }

    if (this.camera.position.y !== player.y) {
      const diff = player.y - this.camera.position.y;
      this.camera.position.y += 0.1 * diff;
    }
  };

  calculateAspect = () => {
    return this.canvas.clientWidth / this.canvas.clientHeight;
  };

  calculateLeft = () => {
    return (this.frustumSize * this.aspect) / -2;
  };

  calculateRight = () => {
    return (this.frustumSize * this.aspect) / 2;
  };

  calculateTop = () => {
    return this.frustumSize / 2;
  };

  calculateBottom = () => {
    return this.frustumSize / -2;
  };
}
