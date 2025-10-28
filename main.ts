import * as THREE from "three";
import Player from "./classes/Player";
import Controls from "./classes/Controls";
import Camera from "./classes/Camera";
import Mouse from "./classes/Mouse";
import Pointer from "./classes/Pointer";
import Game from "./classes/Game";
import Menu from "./classes/Menu";

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

const game = new Game(
  renderer,
  scene,
  userId,
  player1,
  players,
  controls,
  mouse,
  camera,
  pointer
);

// menu 'tings
const menu = new Menu(game, camera);
