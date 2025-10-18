import { randomHexColorCode } from "./utils";
import Player from "./Player";

export function handlePositionUpdate(json, players, scene) {
  if (!players.has(json.userId)) {
    const newPlayer = new Player(randomHexColorCode());
    players.set(json.userId, newPlayer);
    scene.add(newPlayer.mesh);
  }

  const player = players.get(json.userId);
  player.x = json.payload.x;
  player.y = json.payload.y;
}

export function handleAuthoritativeUpdate(json, players, scene) {
  if (!players.has(json.userId)) {
    const newPlayer = new Player(randomHexColorCode());
    players.set(json.userId, newPlayer);
    scene.add(newPlayer.mesh);
  }

  players.forEach((player, userId) => {
    if (!Object.keys(json.payload.players).includes(userId)) {
      scene.remove(player.mesh);
      players.delete(userId);
    }
  });

  Object.entries(json.payload.players).forEach(([userId, player]) => {
    var localPlayer = players.get(userId);
    if (localPlayer) {
      localPlayer.x = player.x;
      localPlayer.y = player.y;
      localPlayer.vx = player.vx;
      localPlayer.vy = player.vy;
    }
  });
}
