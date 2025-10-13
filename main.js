import * as THREE from "three";

//WebSockets
const status = document.getElementById("status");

// Connect to the WebSocket server
const ws = new WebSocket("ws://localhost:8080/ws/games/1337");

// Connection opened
ws.onopen = () => {
  status.textContent = "Connected to server";
  status.style.color = "green";
};

// Handle errors
ws.onerror = (error) => {
  status.textContent = "Error: " + error.message;
  status.style.color = "red";
};

// Handle connection close
ws.onclose = () => {
  status.textContent = "Disconnected from server";
  status.style.color = "red";
};

const scene = new THREE.Scene();

//renderer
let canvas = document.getElementById("canvas");
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

//camera
const aspect = canvas.clientWidth / canvas.clientHeight;
const frustumSize = 10;
const camera = new THREE.OrthographicCamera(
  (frustumSize * aspect) / -2,
  (frustumSize * aspect) / 2,
  frustumSize / 2,
  frustumSize / -2,
  0.1,
  1000
);
camera.position.z = 5;

//player 1 circle
const geometry = new THREE.CircleGeometry(0.1, 64);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const circle = new THREE.Mesh(geometry, material);
scene.add(circle);
let vx = 0;
let vy = 0;

//control logic
let up = false;
let down = false;
let left = false;
let right = false;

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") {
    up = true;
  }
  if (e.key === "ArrowDown") {
    down = true;
  }
  if (e.key === "ArrowLeft") {
    left = true;
  }
  if (e.key === "ArrowRight") {
    right = true;
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowUp") {
    up = false;
  }
  if (e.key === "ArrowDown") {
    down = false;
  }
  if (e.key === "ArrowLeft") {
    left = false;
  }
  if (e.key === "ArrowRight") {
    right = false;
  }
});

//logic loops
let lastUpdate = performance.now();
const timestep = 1000 / 60;

function gameLoop() {
  const now = performance.now();
  let dt = now - lastUpdate;

  while (dt >= timestep) {
    updateGame();
    updateServer();
    dt -= timestep;
    lastUpdate += timestep;
  }

  setTimeout(gameLoop, 0);
}

function updateGame() {
  if (up && vy < 0.1) {
    vy += 0.01;
  }
  if (down && vy > -0.1) {
    vy -= 0.01;
  }
  if (left && vx > -0.1) {
    vx -= 0.01;
  }
  if (right && vx < 0.1) {
    vx += 0.01;
  }

  if (vx > 0) {
    vx -= 0.0025;
    if (vx < 0.005) {
      vx = 0;
    }
  } else if (vx < 0) {
    vx += 0.0025;
    if (vx > -0.005) {
      vx = 0;
    }
  }

  if (vy > 0) {
    vy -= 0.0025;
    if (vy < 0.005) {
      vy = 0;
    }
  } else if (vy < 0) {
    vy += 0.0025;
    if (vy > -0.005) {
      vy = 0;
    }
  }

  circle.position.x += vx;
  circle.position.y += vy;
}

function updateServer() {
  if (ws.OPEN && (vx !== 0 || vy !== 0)) {
    var playerPosition = {
      x: circle.position.x,
      y: circle.position.y,
    };
    ws.send(JSON.stringify(playerPosition));
  }
}

function renderLoop() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
  requestAnimationFrame(renderLoop);
}

gameLoop();
renderLoop();
