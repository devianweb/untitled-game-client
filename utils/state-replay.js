/**
 * Replay a single input on a player using deterministic physics
 * This mirrors the server-side physics order: acceleration -> friction -> apply velocity
 * 
 * @param {Object} player - Player object with properties: x, y, vx, vy, maxV, acceleration, deceleration
 * @param {Object} input - Input object with boolean properties: up, down, left, right
 */
export function replayInput(player, input) {
  // Apply acceleration based on input
  if (input.up && player.vy < player.maxV) {
    player.vy += player.acceleration;
  }
  if (input.down && player.vy > -player.maxV) {
    player.vy -= player.acceleration;
  }
  if (input.left && player.vx > -player.maxV) {
    player.vx -= player.acceleration;
  }
  if (input.right && player.vx < player.maxV) {
    player.vx += player.acceleration;
  }

  // Apply friction/deceleration
  if (player.vx > 0) {
    player.vx -= player.deceleration;
    if (player.vx < 0.005) {
      player.vx = 0;
    }
  } else if (player.vx < 0) {
    player.vx += player.deceleration;
    if (player.vx > -0.005) {
      player.vx = 0;
    }
  }

  if (player.vy > 0) {
    player.vy -= player.deceleration;
    if (player.vy < 0.005) {
      player.vy = 0;
    }
  } else if (player.vy < 0) {
    player.vy += player.deceleration;
    if (player.vy > -0.005) {
      player.vy = 0;
    }
  }

  // Apply velocity to position
  player.x += player.vx;
  player.y += player.vy;
}
