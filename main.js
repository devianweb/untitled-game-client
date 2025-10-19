import * as THREE from "three";
import Player from "./classes/Player";
import {
  handlePositionUpdate,
  handleAuthoritativeUpdate,
} from "./utils/ws-utils";
import { replayInput } from "./utils/state-replay";
import Controls from "./classes/Controls";
import Camera from "./classes/Camera";

const userId = crypto.randomUUID();
console.log("client: " + userId);
const players = new Map();
let sendFinalInputTick = false;

// Input sequence tracking for prediction/reconciliation
let inputSeq = 0;
const pendingInputs = [];

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
let accumulator = 0;

function gameLoop(currentTime) {
  const deltaTime = currentTime - lastUpdate;
  lastUpdate = currentTime;
  accumulator += deltaTime;

  while (accumulator >= timestep) {
    // Apply local prediction by replaying the current input state
    replayInput(player1, {
      up: controls.up,
      down: controls.down,
      left: controls.left,
      right: controls.right,
    });
    
    camera.updateCameraPosition(player1);
    updateServer();
    accumulator -= timestep;
    if (tick % 600 == 0) {
      console.log(players);
      console.log(camera);
    }

    tick++;
  }

  requestAnimationFrame(gameLoop);
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
      inputSeq++;
      const input = {
        seq: inputSeq,
        up: controls.up,
        down: controls.down,
        left: controls.left,
        right: controls.right,
      };
      var message = {
        userId: userId,
        type: "INPUT",
        payload: input,
      };
      ws.send(JSON.stringify(message));
      pendingInputs.push(input);
      if (!controls.up && !controls.down && !controls.left && !controls.right)
        sendFinalInputTick = false;
    }
  }
}

function renderLoop() {
  players.forEach((player, playerId) => {
    const isLocalPlayer = playerId === userId;
    
    if (player.mesh.position.x !== player.x) {
      const diff = player.x - player.mesh.position.x;
      // Direct assignment for local player, smooth interpolation for remote
      player.mesh.position.x += isLocalPlayer ? diff : 0.7 * diff;
    }

    if (player.mesh.position.y !== player.y) {
      const diff = player.y - player.mesh.position.y;
      // Direct assignment for local player, smooth interpolation for remote
      player.mesh.position.y += isLocalPlayer ? diff : 0.7 * diff;
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
    handlePositionUpdate(json, players, scene, { userId, pendingInputs });
  }

  if (json.type === "AUTHORITATIVE") {
    handleAuthoritativeUpdate(json, players, scene);
  }
};

requestAnimationFrame(gameLoop);
renderLoop();
