import * as THREE from "three";

export function makeCamera(aspect) {
  const frustumSize = 10;
  let camera = new THREE.OrthographicCamera(
    (frustumSize * aspect) / -2,
    (frustumSize * aspect) / 2,
    frustumSize / 2,
    frustumSize / -2,
    0.1,
    1000
  );
  camera.position.z = 5;
  return camera;
}
