export class Knife {
  constructor(position) {
    this.x = position.x;
    this.y = position.y;
  }

  get position() {
    return { x: this.x, y: this.y };
  }

  set position(pos) {
    this.x = pos.x;
    this.y = pos.y;
  }
}
