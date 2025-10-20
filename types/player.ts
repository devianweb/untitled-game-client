import type { ControlInputs, InputHistoryEntry } from "./controls";

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export type PositionHistory = [string, number, number, number, number];

export interface PlayerConstructorOptions {
  materialColor?: number;
  controls?: import("../classes/Controls").default | null;
}
