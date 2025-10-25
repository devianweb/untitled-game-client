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
    player: {
      position: { x: number; y: number };
      velocity: { x: number; y: number };
    }
  ): void => {
    if (!this.controls) return;

    const serverPos = new THREE.Vector3(
      player.position.x,
      player.position.y,
      0
    );
    const serverVel = new THREE.Vector3(
      player.velocity.x,
      player.velocity.y,
      0
    );

    for (let i = 0; i < this.controls.history.length; i++) {
      const entry = this.controls.history[i];
      const inputs = entry.inputs;
      if (entry.seqId > serverSeqId) {
        const { newPosition, newVelocity } = this.calculateNewPosition(
          serverPos,
          serverVel,
          inputs
        );
        serverPos.copy(newPosition);
        serverVel.copy(newVelocity);
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

    const { newPosition, newVelocity } = this.calculateNewPosition(
      this.position,
      this.velocity,
      this.controls.inputs
    );

    this.position.copy(newPosition);
    this.velocity.copy(newVelocity);
  };

  calculateNewPosition = (
    currentPosition: THREE.Vector3,
    currentVelocity: THREE.Vector3,
    inputs: ControlInputs
  ): { newPosition: THREE.Vector3; newVelocity: THREE.Vector3 } => {
    const tempPos = currentPosition.clone();
    const tempVel = currentVelocity.clone();

    // Build input direction vector
    const dir = new THREE.Vector3(
      (inputs.right ? 1 : 0) - (inputs.left ? 1 : 0),
      (inputs.up ? 1 : 0) - (inputs.down ? 1 : 0),
      0
    );

    // Apply acceleration along normalized direction
    if (dir.lengthSq() > 0) {
      dir.normalize().multiplyScalar(this.acceleration);
      tempVel.add(dir);
    }

    // Friction + Deadzone
    if (dir.lengthSq() === 0 && tempVel.lengthSq() > 0) {
      const speed = tempVel.length();
      const newSpeed = speed - this.deceleration;
      if (newSpeed <= 0.005) {
        console.log("Setting velocity to zero due to deadzone");
        tempVel.set(0, 0, 0);
      } else {
        tempVel.multiplyScalar(newSpeed / speed);
      }
    }

    // Clamp Velocity
    if (tempVel.length() > this.maxV) {
      tempVel.multiplyScalar(this.maxV / tempVel.length());
    }

    tempPos.add(tempVel);

    return { newPosition: tempPos, newVelocity: tempVel };
  };
}
