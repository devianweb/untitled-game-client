import * as THREE from "three";

export default class Player {
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;

  maxV = 0.1;
  acceleration = this.maxV * 0.1;
  deceleration = this.maxV * 0.025;

  mesh;
  controls;

  constructor({ materialColor = 0x00ff00, controls = null } = {}) {
    const geometry = new THREE.CircleGeometry(0.1, 64);
    const material = new THREE.MeshBasicMaterial({ color: materialColor });
    this.mesh = new THREE.Mesh(geometry, material);
    this.controls = controls;
  }

  reconcile = (serverSeqId) => {
    let count = 0;
    for (let i = 0; i < this.controls.history.length; i++) {
      if (this.controls.history[i].seqId > serverSeqId) {
        this.updatePlayerPositionWithInputs(this.controls.history[i].inputs);
        count++;
      }
    }

    this.controls.history = this.controls.history.filter(
      (h) => h.seqId > serverSeqId
    );
    console.log("reconciled " + count + " inputs");
  };

  updatePlayerPosition = () => {
    this.updatePlayerPositionWithInputs(this.controls.inputs);
  };

  updatePlayerPositionWithInputs = (inputs) => {
    if (inputs.up && this.vy < this.maxV) {
      this.vy += this.acceleration;
    }
    if (inputs.down && this.vy > -this.maxV) {
      this.vy -= this.acceleration;
    }
    if (inputs.left && this.vx > -this.maxV) {
      this.vx -= this.acceleration;
    }
    if (inputs.right && this.vx < this.maxV) {
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
