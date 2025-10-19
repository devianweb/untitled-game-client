import { randomHexColorCode } from "./utils";
import Player from "../classes/Player";
import { replayInput } from "./state-replay";

const DEBUG = false; // Set to true to enable debug logging

export function handlePositionUpdate(json, players, scene, context = {}) {
  if (!players.has(json.userId)) {
    const newPlayer = new Player({ materialColor: randomHexColorCode() });
    players.set(json.userId, newPlayer);
    scene.add(newPlayer.mesh);
  }

  const player = players.get(json.userId);
  const isLocalPlayer = context.userId && json.userId === context.userId;

  if (!isLocalPlayer) {
    // Remote player: set position and velocity directly
    player.x = json.payload.x;
    player.y = json.payload.y;
    if (json.payload.vx !== undefined) player.vx = json.payload.vx;
    if (json.payload.vy !== undefined) player.vy = json.payload.vy;
  } else {
    // Local player: reconciliation with server
    const lastSeq = json.payload.lastSeq;
    
    if (lastSeq !== undefined && context.pendingInputs) {
      // Server supports input sequence numbers
      if (DEBUG) {
        console.log('POSITION lastSeq:', lastSeq, 'pendingInputs:', context.pendingInputs.length);
      }

      // Prune acknowledged inputs
      const firstUnacknowledgedIndex = context.pendingInputs.findIndex(input => input.seq > lastSeq);
      if (firstUnacknowledgedIndex === -1) {
        // All inputs have been acknowledged
        context.pendingInputs.length = 0;
      } else {
        // Remove all inputs up to (but not including) the first unacknowledged
        context.pendingInputs.splice(0, firstUnacknowledgedIndex);
      }
      
      // Reset to server authoritative state
      player.x = json.payload.x;
      player.y = json.payload.y;
      player.vx = json.payload.vx !== undefined ? json.payload.vx : 0;
      player.vy = json.payload.vy !== undefined ? json.payload.vy : 0;

      // Replay remaining pending inputs
      context.pendingInputs.forEach(input => {
        replayInput(player, input);
      });
    } else {
      // Backward compatibility: no lastSeq from server
      player.x = json.payload.x;
      player.y = json.payload.y;
      if (json.payload.vx !== undefined) player.vx = json.payload.vx;
      if (json.payload.vy !== undefined) player.vy = json.payload.vy;
    }
  }
}

export function handleAuthoritativeUpdate(json, players, scene) {
  if (!players.has(json.userId)) {
    const newPlayer = new Player({ materialColor: randomHexColorCode() });
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
