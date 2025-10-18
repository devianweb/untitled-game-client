import * as THREE from "three";

export default class Player {
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;

  maxV = 0.1;
  acceleration = maxV * 0.1;
  deceleration = maxV * 0.025;

  mesh;
  controls;

  constructor({ materialColor = 0x00ff00, controls = null } = {}) {
    const geometry = new THREE.CircleGeometry(0.1, 64);
    const material = new THREE.MeshBasicMaterial({ color: materialColor });
    this.mesh = new THREE.Mesh(geometry, material);
    this.controls = controls;
  }

  updatePlayerPosition = () => {
    if (this.controls.up && this.vy < this.maxV) {
      this.vy += this.acceleration;
    }
    if (this.controls.down && this.vy > -this.maxV) {
      this.vy -= this.acceleration;
    }
    if (this.controls.left && this.vx > -this.maxV) {
      this.vx -= this.acceleration;
    }
    if (this.controls.right && this.vx < this.maxV) {
      this.vx += this.acceleration;
    }

    if (this.vx > 0) {
      this.vx -= this.deceleration;
      if (this.vx < 0.005) {
        this.vx = 0;
      }
    } else if (this.vx < 0) {
      this.vx += this.deceleration;
      if (this.vx > -0.005) {
        this.vx = 0;
      }
    }

    if (this.vy > 0) {
      this.vy -= this.deceleration;
      if (this.vy < 0.005) {
        this.vy = 0;
      }
    } else if (this.vy < 0) {
      this.vy += this.deceleration;
      if (this.vy > -0.005) {
        this.vy = 0;
      }
    }

    this.x += this.vx;
    this.y += this.vy;
  };
}
