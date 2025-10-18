import * as THREE from "three";

export default class Player {
  mesh;
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;

  constructor(materialColor) {
    const geometry = new THREE.CircleGeometry(0.1, 64);
    const material = new THREE.MeshBasicMaterial({ color: materialColor });
    this.mesh = new THREE.Mesh(geometry, material);
  }
}
