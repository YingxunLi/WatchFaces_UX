Homeworks.aufgabe = 4;

let rand = 400;
let grid = 40;
let field;

class Block {

  constructor(attributes) {
    this.attributes = attributes;
  }

  draw() {
    fill(this.attributes.color);
    rect(rand + this.attributes.pos.x * grid, rand + this.attributes.pos.y * grid, this.attributes.size, this.attributes.size);
  }

}

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('thecanvas');
  field = new Block({color: 'green', pos: {x: 0, y: 0}, size: 20});
}

function draw() {
  field.draw();
}
