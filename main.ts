import * as THREE from "three";
import Player from "./classes/Player";
import {
  handlePositionUpdate,
  handleAuthoritativeUpdate,
} from "./utils/ws-utils";
import { ServerMessage } from "./types";
import Controls from "./classes/Controls";
import Camera from "./classes/Camera";
import { InputMessage } from "./types";
import Mouse from "./classes/Mouse";
import Pointer from "./classes/Pointer";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;

// camera
const camera = new Camera(canvas);

// mouse
const mouse = new Mouse(canvas, camera.camera);

const userId: string = crypto.randomUUID();
console.log("client: " + userId);
const players: Map<string, Player> = new Map();

const scene = new THREE.Scene();
const controls = new Controls();

// create client player
const player1 = new Player({ controls: controls });
const pointer = new Pointer(mouse, player1);

players.set(userId, player1);
scene.add(player1.mesh);
scene.add(pointer.line);

// renderer
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// background
const geometry = new THREE.BufferGeometry();
const vertices: number[] = [];

for (let i = 0; i < 10000; i++) {
  vertices.push(THREE.MathUtils.randFloatSpread(100));
  vertices.push(THREE.MathUtils.randFloatSpread(100));
  vertices.push(-1);
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

// coordinates
const coordinates = document.getElementById("coordinates") as HTMLDivElement;
const mouseCoordinates = document.getElementById(
  "mouse-coordinates"
) as HTMLDivElement;

// logic loops
let lastUpdate = performance.now();
const timestep = 1000 / 60;
let tick = 0;
let seqId = 0;
let sendFinalInputTick = false;
let messages: ServerMessage[] = [];

function gameLoop() {
  const now = performance.now();
  let dt = now - lastUpdate;

  while (dt >= timestep) {
    // console.log(json);
    messages.forEach((json) => {
      if (json.type === "POSITION") {
        handlePositionUpdate(json, players, scene);
      } else if (json.type === "AUTHORITATIVE") {
        handleAuthoritativeUpdate(json, players, scene, userId);
      }
    });
    while (messages.length > 0) messages.pop();

    //mouse bits
    mouse.update();

    player1.updatePlayerPosition();
    pointer.update();
    camera.updateCameraPosition(player1);
    updateServer();

    dt -= timestep;
    lastUpdate += timestep;
    if (tick % 600 === 0) {
      console.log(players);
      console.log(camera);
    }

    coordinates.textContent = `${player1.position.x.toFixed(
      2
    )}, ${player1.position.y.toFixed(2)}`;
    mouseCoordinates.textContent = `${mouse.worldPoint.x.toFixed(
      2
    )}, ${mouse.worldPoint.y.toFixed(2)}`;

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
      const message: InputMessage = {
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
  players.forEach((p) => {
    p.mesh.position.lerp(p.position, 0.3);
  });

  renderer.render(scene, camera.camera);
}

// WebSockets
const status = document.getElementById("status") as HTMLDivElement;

// Connect to the WebSocket server
const ws = new WebSocket(
  `wss://semiglazed-too-kimberlie.ngrok-free.dev/ws/games/1337?userId=${userId}`
);

ws.onopen = () => {
  status.textContent = "Connected to server";
  status.style.color = "green";
};

ws.onerror = (error: Event) => {
  // WebSocket error is broadly typed; narrow if needed later
  status.textContent = "Error";
  status.style.color = "red";
  console.error(error);
};

ws.onclose = () => {
  status.textContent = "Disconnected from server";
  status.style.color = "red";
};

ws.onmessage = (event: MessageEvent<string>) => {
  try {
    const json: ServerMessage = JSON.parse(event.data);
    // console.log(json);
    messages.push(json);
  } catch (e) {
    console.warn("Received malformed message", e);
  }
};

requestAnimationFrame(gameLoop);
renderer.setAnimationLoop(renderLoop);
