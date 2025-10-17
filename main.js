import * as THREE from "three";
import { Circle } from "./Circle";

const userId = crypto.randomUUID();
const players = new Map();
let sendFinalInputTick = false;

const randomHexColorCode = () => {
  let n = (Math.random() * 0xfffff * 1000000).toString(16);
  return "#" + n.slice(0, 6);
};

//WebSockets
const status = document.getElementById("status");

// Connect to the WebSocket server
const ws = new WebSocket(`ws://localhost:8080/ws/games/1337?userId=${userId}`);

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

// Handle message recieved
ws.onmessage = (event) => {
  var json = JSON.parse(event.data);
  // console.log(json);
  if (json.type === "POSITION") {
    handlePositionUpdate(json);
  }

  if (json.type === "AUTHORITATIVE") {
    handleAuthoritativeUpdate(json);
  }
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

//circles
const player1 = new Circle(0x00ff00);
players.set(userId, player1);
scene.add(player1.mesh);

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
let tick = 0;

function gameLoop() {
  const now = performance.now();
  let dt = now - lastUpdate;

  while (dt >= timestep) {
    updateGame();
    updateServer();
    dt -= timestep;
    lastUpdate += timestep;
    if (tick % 600 == 0) {
      console.log("x: " + player1.mesh.position.x);
      console.log("y: " + player1.mesh.position.y);
      console.log("vx: " + player1.vx);
      console.log("vy: " + player1.vy);
    }
    tick++;
  }

  setTimeout(gameLoop, 0);
}

function updateGame() {
  if (up && player1.vy < 0.1) {
    player1.vy += 0.01;
  }
  if (down && player1.vy > -0.1) {
    player1.vy -= 0.01;
  }
  if (left && player1.vx > -0.1) {
    player1.vx -= 0.01;
  }
  if (right && player1.vx < 0.1) {
    player1.vx += 0.01;
  }

  if (player1.vx > 0) {
    player1.vx -= 0.0025;
    if (player1.vx < 0.005) {
      player1.vx = 0;
    }
  } else if (player1.vx < 0) {
    player1.vx += 0.0025;
    if (player1.vx > -0.005) {
      player1.vx = 0;
    }
  }

  if (player1.vy > 0) {
    player1.vy -= 0.0025;
    if (player1.vy < 0.005) {
      player1.vy = 0;
    }
  } else if (player1.vy < 0) {
    player1.vy += 0.0025;
    if (player1.vy > -0.005) {
      player1.vy = 0;
    }
  }

  player1.mesh.position.x += player1.vx;
  player1.mesh.position.y += player1.vy;
}

function updateServer() {
  if (ws.readyState === WebSocket.OPEN) {
    if (up || down || left || right || sendFinalInputTick) {
      sendFinalInputTick = true;
      var message = {
        userId: userId,
        type: "INPUT",
        payload: {
          up: up,
          down: down,
          left: left,
          right: right,
        },
      };
      ws.send(JSON.stringify(message));
      if (!up && !down && !left && !right) sendFinalInputTick = false;
    }
  }
}

function renderLoop() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
  requestAnimationFrame(renderLoop);
}

function handlePositionUpdate(json) {
  if (!players.has(json.userId)) {
    const newPlayer = new Circle(randomHexColorCode());
    players.set(json.userId, newPlayer);
    scene.add(newPlayer.mesh);
  }

  const player = players.get(json.userId);
  player.mesh.position.x = json.payload.x;
  player.mesh.position.y = json.payload.y;
}

function handleAuthoritativeUpdate(json) {
  Object.entries(json.payload.players).forEach(([userId, player]) => {
    var localPlayer = players.get(userId);
    localPlayer.mesh.position.x = player.x;
    localPlayer.mesh.position.y = player.y;
    localPlayer.vx = player.vx;
    localPlayer.vy = player.vy;
  });
}

gameLoop();
renderLoop();
