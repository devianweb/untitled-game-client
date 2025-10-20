import * as THREE from "three";
import Controls from "./Controls";
import { ControlInputs, PlayerConstructorOptions } from "../types";

export default class Player {
  x: number = 0;
  y: number = 0;
  vx: number = 0;
  vy: number = 0;

  maxV: number = 0.1;
  acceleration: number = this.maxV * 0.1;
  deceleration: number = this.maxV * 0.025;

  mesh: THREE.Mesh;
  controls: Controls | null;

  constructor({
    materialColor = 0x00ff00,
    controls = null,
  }: PlayerConstructorOptions = {}) {
    const geometry = new THREE.CircleGeometry(0.1, 64);
    const material = new THREE.MeshBasicMaterial({ color: materialColor });
    this.mesh = new THREE.Mesh(geometry, material);
    this.controls = controls;
  }

  reconcile = (
    serverSeqId: number,
    player: { x: number; y: number; vx: number; vy: number }
  ): void => {
    if (!this.controls) return;

    let tempX = player.x;
    let tempY = player.y;
    let tempVx = player.vx;
    let tempVy = player.vy;

    for (let i = 0; i < this.controls.history.length; i++) {
      const entry = this.controls.history[i];
      const inputs = entry.inputs;
      if (entry.seqId > serverSeqId) {
        if (inputs.up && tempVy < this.maxV) {
          tempVy += this.acceleration;
        }
        if (inputs.down && tempVy > -this.maxV) {
          tempVy -= this.acceleration;
        }
        if (inputs.left && tempVx > -this.maxV) {
          tempVx -= this.acceleration;
        }
        if (inputs.right && tempVx < this.maxV) {
          tempVx += this.acceleration;
        }

        if (tempVx > 0) {
          tempVx -= this.deceleration;
          if (tempVx < 0.005) {
            tempVx = 0;
          }
        } else if (tempVx < 0) {
          tempVx += this.deceleration;
          if (tempVx > -0.005) {
            tempVx = 0;
          }
        }

        if (tempVy > 0) {
          tempVy -= this.deceleration;
          if (tempVy < 0.005) {
            tempVy = 0;
          }
        } else if (tempVy < 0) {
          tempVy += this.deceleration;
          if (tempVy > -0.005) {
            tempVy = 0;
          }
        }

        tempX += tempVx;
        tempY += tempVy;
      }
    }

    this.x = tempX;
    this.y = tempY;
    this.vx = tempVx;
    this.vy = tempVy;

    this.controls.history = this.controls.history.filter(
      (h) => h.seqId > serverSeqId
    );
  };

  updatePlayerPosition = (): void => {
    if (!this.controls) return;
    this.updatePlayerPositionWithInputs(this.controls.inputs);
  };

  updatePlayerPositionWithInputs = (inputs: ControlInputs): void => {
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
