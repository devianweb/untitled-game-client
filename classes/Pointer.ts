import * as THREE from "three";
import Mouse from "./Mouse";
import Player from "./Player";

export default class Pointer {
  player: Player;
  mouse: Mouse;
  lineStart: THREE.Vector3;
  line: THREE.Line;

  constructor(mouse: Mouse, player: Player) {
    this.player = player;
    this.mouse = mouse;

    this.lineStart = player.position.clone();
    this.lineStart.z = -0.5;

    const geometry = new THREE.BufferGeometry().setFromPoints([
      this.lineStart,
      this.mouse.worldPoint.clone().setZ(-0.5),
    ]);
    const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
    this.line = new THREE.Line(geometry, material);
  }

  update() {
    const positions = this.line.geometry.attributes.position
      .array as Float32Array;
    this.lineStart.lerp(this.player.position, 0.3);
    positions[0] = this.lineStart.x;
    positions[1] = this.lineStart.y;
    positions[3] = this.mouse.worldPoint.x;
    positions[4] = this.mouse.worldPoint.y;
    this.line.geometry.attributes.position.needsUpdate = true;
    this.line.geometry.computeBoundingSphere();
  }
}
