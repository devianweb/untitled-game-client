import Controls from "../classes/Controls";
import Pointer from "../classes/Pointer";

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
  controls?: Controls | null;
  pointer?: Pointer | null;
}
