import { randomHexColorCode } from "./utils";
import Player from "../classes/Player";
import * as THREE from "three";
import { PositionMessage, AuthoritativeMessage } from "../types";

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
  player.position.x = json.payload.x;
  player.position.y = json.payload.y;
  player.velocity.x = json.payload.vx;
  player.velocity.y = json.payload.vy;
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

  Object.entries(json.payload.players).forEach(([userId, serverState]) => {
    const player = players.get(userId);
    if (player && userId !== clientId) {
      player.position.x = serverState.x;
      player.position.y = serverState.y;
      player.velocity.x = serverState.vx;
      player.velocity.y = serverState.vy;
    }

    if (player && userId === clientId) {
      player.reconcile(json.seqId, serverState);
    }
  });
}
