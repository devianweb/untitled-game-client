import * as THREE from "three";
import Player from "./Player";
import { handlePositionUpdate, handleAuthoritativeUpdate } from "./ws-utils";
import { makeCamera } from "./three-utils";

const userId = crypto.randomUUID();
console.log("client: " + userId);
const players = new Map();
let sendFinalInputTick = false;

const scene = new THREE.Scene();

//create client player
const player1 = new Player(0x00ff00);
players.set(userId, player1);
scene.add(player1.mesh);

//renderer
let canvas = document.getElementById("canvas");
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

//camera
const aspect = canvas.clientWidth / canvas.clientHeight;
let camera = makeCamera(aspect);

//control logic
let up = false;
let down = false;
let left = false;
let right = false;

//update camera on resize
document.defaultView.addEventListener("resize", (e) => {
  const aspect = canvas.clientWidth / canvas.clientHeight;
  camera = makeCamera(aspect);
});

//button press listeners
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
      console.log(players);
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

  player1.x += player1.vx;
  player1.y += player1.vy;
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
  players.forEach((player1) => {
    if (player1.mesh.position.x !== player1.x) {
      const diff = player1.x - player1.mesh.position.x;
      player1.mesh.position.x += 0.7 * diff;
    }

    if (player1.mesh.position.y !== player1.y) {
      const diff = player1.y - player1.mesh.position.y;
      player1.mesh.position.y += 0.7 * diff;
    }
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
  requestAnimationFrame(renderLoop);
}

//WebSockets
const status = document.getElementById("status");

// Connect to the WebSocket server
const ws = new WebSocket(
  `wss://semiglazed-too-kimberlie.ngrok-free.dev/ws/games/1337?userId=${userId}`
);

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
    handlePositionUpdate(json, players, scene);
  }

  if (json.type === "AUTHORITATIVE") {
    handleAuthoritativeUpdate(json, players, scene);
  }
};

gameLoop();
renderLoop();
