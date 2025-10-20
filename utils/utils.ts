export function randomHexColorCode(): string {
  const n = (Math.random() * 0xfffff * 1_000_000).toString(16);
  return "#" + n.slice(0, 6);
}
