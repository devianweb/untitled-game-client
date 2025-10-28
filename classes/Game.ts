import * as THREE from "three";
import Player from "./Player";
import Controls from "./Controls";
import { InputMessage, ServerMessage } from "../types";
import {
  handleAuthoritativeUpdate,
  handlePositionUpdate,
} from "../utils/ws-utils";
import Mouse from "./Mouse";
import Camera from "./Camera";
import Pointer from "./Pointer";

export default class Game {
  // threejs
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;

  // game
  gameid: string | null = null;
  userId: string;
  player1: Player;
  players: Map<string, Player>;
  controls: Controls;
  mouse: Mouse;
  camera: Camera;
  pointer: Pointer;
  lastUpdate = performance.now();
  timestep = 1000 / 60;

  // networking
  ws: WebSocket | null = null;
  tick = 0;
  seqId = 0;
  sendFinalInputTick = false;
  messages: ServerMessage[] = [];

  // ui
  // coordinates
  coordinates = document.getElementById("coordinates") as HTMLDivElement;
  mouseCoordinates = document.getElementById(
    "mouse-coordinates"
  ) as HTMLDivElement;

  //status
  status = document.getElementById("status") as HTMLDivElement;

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    userId: string,
    player1: Player,
    players: Map<string, Player>,
    controls: Controls,
    mouse: Mouse,
    camera: Camera,
    pointer: Pointer
  ) {
    this.renderer = renderer;
    this.scene = scene;
    this.userId = userId;
    this.player1 = player1;
    this.players = players;
    this.controls = controls;
    this.mouse = mouse;
    this.camera = camera;
    this.pointer = pointer;
  }

  start = (gameId: string) => {
    this.gameid = gameId;
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.camera.updateCameraSize();
    this.createBackground();
    this.ws = this.setupWebSocketHandlers(gameId);

    requestAnimationFrame(this.gameLoop);
    this.renderer.setAnimationLoop(this.renderLoop);
  };

  gameLoop = () => {
    const now = performance.now();
    let dt = now - this.lastUpdate;

    while (dt >= this.timestep) {
      // console.log(json);
      this.messages.forEach((json) => {
        if (json.type === "POSITION") {
          handlePositionUpdate(json, this.players, this.scene);
        } else if (json.type === "AUTHORITATIVE") {
          handleAuthoritativeUpdate(
            json,
            this.players,
            this.scene,
            this.userId
          );
        }
      });
      while (this.messages.length > 0) this.messages.pop();

      //mouse bits
      this.mouse.update();

      this.player1.updatePlayerPosition();
      this.pointer.update();
      this.camera.updateCameraPosition(this.player1);
      this.updateServer();

      dt -= this.timestep;
      this.lastUpdate += this.timestep;
      if (this.tick % 600 === 0) {
        console.log(this.players);
        console.log(this.camera);
      }

      this.coordinates.textContent = `${this.player1.position.x.toFixed(
        2
      )}, ${this.player1.position.y.toFixed(2)}`;
      this.mouseCoordinates.textContent = `${this.mouse.worldPoint.x.toFixed(
        2
      )}, ${this.mouse.worldPoint.y.toFixed(2)}`;

      this.tick++;
    }

    requestAnimationFrame(this.gameLoop);
  };

  renderLoop = () => {
    this.players.forEach((p) => {
      p.mesh.position.lerp(p.position, 0.3);
    });

    this.renderer.render(this.scene, this.camera.camera);
  };

  updateServer = () => {
    if (this.ws !== null && this.ws.readyState === WebSocket.OPEN) {
      if (
        this.controls.inputs.up ||
        this.controls.inputs.down ||
        this.controls.inputs.left ||
        this.controls.inputs.right ||
        this.sendFinalInputTick
      ) {
        this.sendFinalInputTick = true;
        const message: InputMessage = {
          userId: this.userId,
          type: "INPUT",
          seqId: this.seqId,
          payload: this.controls.inputs,
        };
        this.ws.send(JSON.stringify(message));
        this.controls.updateHistory(this.seqId);
        this.seqId++;
        if (
          !this.controls.inputs.up &&
          !this.controls.inputs.down &&
          !this.controls.inputs.left &&
          !this.controls.inputs.right
        )
          this.sendFinalInputTick = false;
      }
    }
  };

  createBackground = () => {
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
    this.scene.add(particles);
  };

  setupWebSocketHandlers = (gameId: string): WebSocket => {
    // WebSockets
    // Connect to the WebSocket server
    const ws = new WebSocket(
      `wss://semiglazed-too-kimberlie.ngrok-free.dev/ws/games/${gameId}?userId=${this.userId}`
    );

    ws.onopen = () => {
      console.log("WebSocket connection established");
      this.status.textContent = "Connected to server";
      this.status.classList.remove(
        "text-green-500",
        "text-red-500",
        "text-yellow-500"
      );
      this.status.classList.add("text-green-500");
    };

    ws.onerror = (error: Event) => {
      console.log("WebSocket error");
      // WebSocket error is broadly typed; narrow if needed later
      this.status.textContent = "Error";
      this.status.classList.remove(
        "text-green-500",
        "text-red-500",
        "text-yellow-500"
      );
      this.status.classList.add("text-red-500");
      console.error(error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
      this.status.textContent = "Disconnected from server";
      this.status.classList.remove(
        "text-green-500",
        "text-red-500",
        "text-yellow-500"
      );
      this.status.classList.add("text-red-500");
    };

    ws.onmessage = (event: MessageEvent<string>) => {
      try {
        const json: ServerMessage = JSON.parse(event.data);
        // console.log(json);
        this.messages.push(json);
      } catch (e) {
        console.warn("Received malformed message", e);
      }
    };

    return ws;
  };
}
