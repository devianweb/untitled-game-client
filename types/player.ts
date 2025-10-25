import type { ControlInputs, InputHistoryEntry } from "./controls";

export interface PlayerState {
  position: {
    x: number;
    y: number;
  };
  velocity: {
    x: number;
    y: number;
  };
}

export interface PlayerConstructorOptions {
  materialColor?: number;
  controls?: import("../classes/Controls").default | null;
}
