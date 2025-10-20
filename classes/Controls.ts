export interface ControlInputs {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

export interface InputHistory {
  seqId: number;
  inputs: ControlInputs;
}

export default class Controls {
  inputs: ControlInputs = {
    up: false,
    down: false,
    left: false,
    right: false,
  };

  history: InputHistory[] = [];

  constructor() {
    // Bind event listeners for key presses
    document.addEventListener("keydown", (e) => this.keyDown(e));
    document.addEventListener("keyup", (e) => this.keyUp(e));
  }

  updateHistory = (seqId: number): void => {
    this.history.push({ seqId, inputs: { ...this.inputs } });
  };

  keyDown = (e: KeyboardEvent): void => {
    switch (e.key) {
      case "ArrowUp":
        this.inputs.up = true;
        break;
      case "ArrowDown":
        this.inputs.down = true;
        break;
      case "ArrowLeft":
        this.inputs.left = true;
        break;
      case "ArrowRight":
        this.inputs.right = true;
        break;
      default:
        break;
    }
  };

  keyUp = (e: KeyboardEvent): void => {
    switch (e.key) {
      case "ArrowUp":
        this.inputs.up = false;
        break;
      case "ArrowDown":
        this.inputs.down = false;
        break;
      case "ArrowLeft":
        this.inputs.left = false;
        break;
      case "ArrowRight":
        this.inputs.right = false;
        break;
      default:
        break;
    }
  };
}
