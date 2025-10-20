export function randomHexColorCode(): number {
  // Returns a random 24-bit color number (0x000000 - 0xFFFFFF)
  return Math.floor(Math.random() * 0xffffff);
}
