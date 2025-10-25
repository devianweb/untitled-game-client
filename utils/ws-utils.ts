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

  console.log(json);
  const player = players.get(json.userId)!;
  player.position.x = json.payload.position.x;
  player.position.y = json.payload.position.y;
  player.velocity.x = json.payload.velocity.x;
  player.velocity.y = json.payload.velocity.y;
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
      player.position.x = serverState.position.x;
      player.position.y = serverState.position.y;
      player.velocity.x = serverState.velocity.x;
      player.velocity.y = serverState.velocity.y;
    }

    if (player && userId === clientId) {
      player.reconcile(json.seqId, serverState);
    }
  });
}
