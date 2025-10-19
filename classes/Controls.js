export default class Controls {
  inputs = {
    up: false,
    down: false,
    left: false,
    right: false,
  };

  history = [];

  constructor() {
    document.addEventListener("keydown", (e) => this.keyDown(e));
    document.addEventListener("keyup", (e) => this.keyUp(e));
  }

  updateHistory = (seqId) => {
    this.history.push({ seqId, inputs: { ...this.inputs } });
  };

  keyDown = (e) => {
    if (e.key === "ArrowUp") {
      this.inputs.up = true;
    }
    if (e.key === "ArrowDown") {
      this.inputs.down = true;
    }
    if (e.key === "ArrowLeft") {
      this.inputs.left = true;
    }
    if (e.key === "ArrowRight") {
      this.inputs.right = true;
    }
  };

  keyUp = (e) => {
    if (e.key === "ArrowUp") {
      this.inputs.up = false;
    }
    if (e.key === "ArrowDown") {
      this.inputs.down = false;
    }
    if (e.key === "ArrowLeft") {
      this.inputs.left = false;
    }
    if (e.key === "ArrowRight") {
      this.inputs.right = false;
    }
  };
}
