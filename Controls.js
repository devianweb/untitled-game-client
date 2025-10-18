export default class Controls {
  up = false;
  down = false;
  left = false;
  right = false;

  constructor() {
    document.addEventListener("keydown", (e) => this.keyDown(e));

    document.addEventListener("keyup", (e) => this.keyUp(e));
  }

  keyDown = (e) => {
    if (e.key === "ArrowUp") {
      this.up = true;
    }
    if (e.key === "ArrowDown") {
      this.down = true;
    }
    if (e.key === "ArrowLeft") {
      this.left = true;
    }
    if (e.key === "ArrowRight") {
      this.right = true;
    }
  };

  keyUp = (e) => {
    if (e.key === "ArrowUp") {
      this.up = false;
    }
    if (e.key === "ArrowDown") {
      this.down = false;
    }
    if (e.key === "ArrowLeft") {
      this.left = false;
    }
    if (e.key === "ArrowRight") {
      this.right = false;
    }
  };
}
