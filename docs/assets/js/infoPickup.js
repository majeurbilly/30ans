export class InfoPickup {
  constructor(info, position, image = null) {
    this.id = info.id;
    this.shortLabel = info.shortLabel;
    this.title = info.title;
    this.body = info.body;
    this.color = info.color;
    this.image = image;
    this.x = position.x;
    this.y = position.y;
    this.collected = false;
  }

  get position() {
    return { x: this.x, y: this.y };
  }
}
