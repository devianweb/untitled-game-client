import * as THREE from "three";
import Player from "./classes/Player";
import {
  handlePositionUpdate,
  handleAuthoritativeUpdate,
} from "./utils/ws-utils";
import Controls from "./classes/Controls";
import Camera from "./classes/Camera";

const userId = crypto.randomUUID();
console.log("client: " + userId);
const players = new Map();

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

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
});

//camera
let camera = new Camera(canvas);

//background
const geometry = new THREE.BufferGeometry();
const vertices = [];
let messages = [];

for (let i = 0; i < 10000; i++) {
  vertices.push(THREE.MathUtils.randFloatSpread(100)); // x
  vertices.push(THREE.MathUtils.randFloatSpread(100)); // y
  vertices.push(-1); // z
}

geometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(vertices, 3)
);

const particles = new THREE.Points(
  geometry,
  new THREE.PointsMaterial({ color: 0x888888 })
);
scene.add(particles);

//coordinates
const coordinates = document.getElementById("coordinates");

//logic loops
let lastUpdate = performance.now();
const timestep = 1000 / 60;
let tick = 0;
let seqId = 0;
let sendFinalInputTick = false;

function gameLoop() {
  const now = performance.now();
  let dt = now - lastUpdate;

  while (dt >= timestep) {
    messages.forEach((json) => {
      // console.log(json);
      if (json.type === "POSITION") {
        handlePositionUpdate(json, players, scene);
      }
  
      if (json.type === "AUTHORITATIVE") {
        handleAuthoritativeUpdate(json, players, scene, userId);
      }
    });
    while (messages.length > 0) messages.pop();

    player1.updatePlayerPosition();
    camera.updateCameraPosition(player1);
    updateServer();

    dt -= timestep;
    lastUpdate += timestep;
    if (tick % 600 == 0) {
      console.log(players);
      console.log(camera);
    }
    coordinates.textContent = `${player1.x}, ${player1.y}`;

    tick++;
  }

  requestAnimationFrame(gameLoop);
}

function updateServer() {
  if (ws.readyState === WebSocket.OPEN) {
    if (
      controls.inputs.up ||
      controls.inputs.down ||
      controls.inputs.left ||
      controls.inputs.right ||
      sendFinalInputTick
    ) {
      sendFinalInputTick = true;
      var message = {
        userId: userId,
        type: "INPUT",
        seqId: seqId,
        payload: controls.inputs,
      };
      ws.send(JSON.stringify(message));
      controls.updateHistory(seqId);
      seqId++;
      if (
        !controls.inputs.up &&
        !controls.inputs.down &&
        !controls.inputs.left &&
        !controls.inputs.right
      )
        sendFinalInputTick = false;
    }
  }
}

function renderLoop() {
  players.forEach((player1, uid) => {
    if (player1.mesh.position.x !== player1.x) {
      const diff = player1.x - player1.mesh.position.x;
      player1.mesh.position.x += 0.3 * diff;
    }

    if (player1.mesh.position.y !== player1.y) {
      const diff = player1.y - player1.mesh.position.y;
      player1.mesh.position.y += 0.3 * diff;
    }
  });
  renderer.render(scene, camera.camera);
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
  messages.push(json);
};

requestAnimationFrame(gameLoop);
renderer.setAnimationLoop(renderLoop);
