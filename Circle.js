import * as THREE from "three";

export class Circle {
  mesh;
  vx = 0;
  vy = 0;

  constructor(materialColor) {
    const geometry = new THREE.CircleGeometry(0.1);
    const material = new THREE.MeshBasicMaterial({ color: materialColor });
    this.mesh = new THREE.Mesh(geometry, material);
  }
}
