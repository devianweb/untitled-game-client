import * as THREE from "three";

const scene = new THREE.Scene();

//renderer
const canvasContainer = document.getElementById("canvascontainer");
const canvas = document.getElementById("canvas");
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);

//camera
const aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
const frustumSize = 10;
const camera = new THREE.OrthographicCamera(
  (frustumSize * aspect) / -2,
  (frustumSize * aspect) / 2,
  frustumSize / 2,
  frustumSize / -2,
  0.1,
  1000
);

//circle geo
const geometry = new THREE.CircleGeometry(1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const circle = new THREE.Mesh(geometry, material);
scene.add(circle);

camera.position.z = 5;

//logic loops
let lastUpdate = performance.now();
const timestep = 1000 / 1;

function gameLoop() {
  const now = performance.now();
  let dt = now - lastUpdate;

  while (dt >= timestep) {
    updateGame();
    dt -= timestep;
    lastUpdate += timestep;
  }

  setTimeout(gameLoop, 0);
}

function updateGame() {
  //game shit here
}

function renderLoop() {
  renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
  renderer.render(scene, camera);
  requestAnimationFrame(renderLoop);
}

gameLoop();
renderLoop();
