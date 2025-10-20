import * as THREE from "three";
import Controls from "./Controls";
import { ControlInputs, PlayerConstructorOptions } from "../types";

export default class Player {
  position: THREE.Vector3 = new THREE.Vector3();
  velocity: THREE.Vector3 = new THREE.Vector3();

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

    const serverPos = new THREE.Vector3(player.x, player.y, 0);
    const serverVel = new THREE.Vector3(player.vx, player.vy, 0);

    for (let i = 0; i < this.controls.history.length; i++) {
      const entry = this.controls.history[i];
      const inputs = entry.inputs;
      if (entry.seqId > serverSeqId) {
        const newPos = this.calculateNewPosition(serverPos, serverVel, inputs);
        serverPos.copy(newPos);
      }
    }

    this.position.copy(serverPos);
    this.velocity.copy(serverVel);

    this.controls.history = this.controls.history.filter(
      (h) => h.seqId > serverSeqId
    );
  };

  updatePlayerPosition = (): void => {
    if (!this.controls) return;
    this.position.copy(
      this.calculateNewPosition(
        this.position,
        this.velocity,
        this.controls.inputs
      )
    );
  };

  calculateNewPosition = (
    currentPosition: THREE.Vector3,
    currentVelocity: THREE.Vector3,
    inputs: ControlInputs
  ): THREE.Vector3 => {
    // Apply input acceleration
    if (inputs.up && currentVelocity.y < this.maxV)
      currentVelocity.y += this.acceleration;
    if (inputs.down && currentVelocity.y > -this.maxV)
      currentVelocity.y -= this.acceleration;
    if (inputs.left && currentVelocity.x > -this.maxV)
      currentVelocity.x -= this.acceleration;
    if (inputs.right && currentVelocity.x < this.maxV)
      currentVelocity.x += this.acceleration;

    // Deceleration X
    if (currentVelocity.x > 0) {
      currentVelocity.x -= this.deceleration;
      if (currentVelocity.x < 0.005) currentVelocity.x = 0;
    } else if (currentVelocity.x < 0) {
      currentVelocity.x += this.deceleration;
      if (currentVelocity.x > -0.005) currentVelocity.x = 0;
    }

    // Deceleration Y
    if (currentVelocity.y > 0) {
      currentVelocity.y -= this.deceleration;
      if (currentVelocity.y < 0.005) currentVelocity.y = 0;
    } else if (currentVelocity.y < 0) {
      currentVelocity.y += this.deceleration;
      if (currentVelocity.y > -0.005) currentVelocity.y = 0;
    }

    // return new position
    return currentPosition.add(currentVelocity);
  };
}
