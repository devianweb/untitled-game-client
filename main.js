import * as THREE from "three";
import Player from "./Player";
import { handlePositionUpdate, handleAuthoritativeUpdate } from "./ws-utils";
import Controls from "./Controls";
import Camera from "./Camera";

const userId = crypto.randomUUID();
console.log("client: " + userId);
const players = new Map();
let sendFinalInputTick = false;

const scene = new THREE.Scene();
const controls = new Controls();

//create client player
const player1 = new Player({ controls: controls });
players.set(userId, player1);
scene.add(player1.mesh);

//renderer
let canvas = document.getElementById("canvas");
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

//camera
let camera = new Camera(canvas);

//logic loops
let lastUpdate = performance.now();
const timestep = 1000 / 60;
let tick = 0;

function gameLoop() {
  const now = performance.now();
  let dt = now - lastUpdate;

  while (dt >= timestep) {
    player1.updatePlayerPosition();
    camera.updateCameraPosition(player1);
    updateServer();
    dt -= timestep;
    lastUpdate += timestep;
    if (tick % 600 == 0) {
      console.log(players);
      console.log(camera);
    }

    tick++;
  }

  setTimeout(gameLoop, 0);
}

function updateServer() {
  if (ws.readyState === WebSocket.OPEN) {
    if (
      controls.up ||
      controls.down ||
      controls.left ||
      controls.right ||
      sendFinalInputTick
    ) {
      sendFinalInputTick = true;
      var message = {
        userId: userId,
        type: "INPUT",
        payload: {
          up: controls.up,
          down: controls.down,
          left: controls.left,
          right: controls.right,
        },
      };
      ws.send(JSON.stringify(message));
      if (!controls.up && !controls.down && !controls.left && !controls.right)
        sendFinalInputTick = false;
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
  renderer.render(scene, camera.camera);
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
