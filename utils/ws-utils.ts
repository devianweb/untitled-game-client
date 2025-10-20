import { randomHexColorCode } from "./utils";
import Player from "../classes/Player";
import * as THREE from "three";

export interface PositionPayload {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface PositionMessage {
  type: "POSITION";
  userId: string;
  payload: PositionPayload;
}

export interface AuthoritativePlayersState {
  [userId: string]: PositionPayload;
}

export interface AuthoritativeMessage {
  type: "AUTHORITATIVE";
  seqId: number;
  userId: string;
  payload: {
    players: AuthoritativePlayersState;
  };
}

export type ServerMessage = PositionMessage | AuthoritativeMessage;

export function handlePositionUpdate(
  json: PositionMessage,
  players: Map<string, Player>,
  scene: THREE.Scene
): void {
  if (!players.has(json.userId)) {
    const newPlayer = new Player({
      materialColor: randomHexColorCode(),
    });
    players.set(json.userId, newPlayer);
    scene.add(newPlayer.mesh);
  }

  const player = players.get(json.userId)!;
  player.x = json.payload.x;
  player.y = json.payload.y;
  player.vx = json.payload.vx;
  player.vy = json.payload.vy;
}

export function handleAuthoritativeUpdate(
  json: AuthoritativeMessage,
  players: Map<string, Player>,
  scene: THREE.Scene,
  clientId: string
): void {
  if (!players.has(json.userId)) {
    const newPlayer = new Player({
      materialColor: randomHexColorCode(),
    });
    players.set(json.userId, newPlayer);
    scene.add(newPlayer.mesh);
  }

  players.forEach((player, userId) => {
    if (!Object.prototype.hasOwnProperty.call(json.payload.players, userId)) {
      scene.remove(player.mesh);
      players.delete(userId);
    }
  });

  Object.entries(json.payload.players).forEach(([userId, playerState]) => {
    const localPlayer = players.get(userId);
    if (localPlayer && userId !== clientId) {
      localPlayer.x = playerState.x;
      localPlayer.y = playerState.y;
      localPlayer.vx = playerState.vx;
      localPlayer.vy = playerState.vy;
    }

    if (localPlayer && userId === clientId) {
      localPlayer.reconcile(json.seqId, playerState);
    }
  });
}
