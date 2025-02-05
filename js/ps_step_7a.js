Homeworks.aufgabe = 7;

const Engine = Matter.Engine;
const Runner = Matter.Runner;
const Bodies = Matter.Bodies;
const Events = Matter.Events;
const World = Matter.World;

// the Matter engine to animate the world
let engine;
let world;
let mouse;
let isDrag = false;
// an array to contain all the blocks created
let blocks = [];

let murmel;

class Propeller extends Block {
  constructor(world, attributes, options) {
    super(world, attributes, options);
    this.attributes.angle = this.attributes.angle || 0
    this.attributes.speed = this.attributes.speed || 0.07
    this.attributes.velocity = this.attributes.velocity || 0.15
  }

  draw() {
    Matter.Body.setAngle(this.body, this.attributes.angle);
    Matter.Body.setAngularVelocity(this.body, this.attributes.velocity);
    this.attributes.angle += this.attributes.speed;
    super.draw()
  }
}

class Mover extends Block {
  constructor(world, attributes, options) {
    super(world, attributes, options);
    this.attributes.dir = this.attributes.dir || { x: 0, y: -1 }
  }

  draw() {
    if (this.body.position.x < this.attributes.min.x || this.body.position.x > this.attributes.max.x) {
      this.attributes.dir.x = -this.attributes.dir.x
    }
    if (this.body.position.y < this.attributes.min.y || this.body.position.y > this.attributes.max.y) {
      this.attributes.dir.y = -this.attributes.dir.y
    }
    Matter.Body.setPosition(this.body, { x: this.body.position.x + this.attributes.dir.x, y: this.body.position.y + this.attributes.dir.y })
    super.draw()
  }
}

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('thecanvas');

  engine = Engine.create();
  world = engine.world;

  // Während der Enticklung der Murmelbahn kan man mit der Maus eingreifen
  mouse = new Mouse(engine, canvas, { stroke: 'blue', strokeWeight: 3 });

  // Oder auch Test-Murmeln in Spiel bringen
  mouse.on("startdrag", evt => {
    isDrag = true;
  });
  mouse.on("mouseup", evt => {
    if (!isDrag) {
      let ball = new Ball(world,
        { x: evt.mouse.position.x, y: evt.mouse.position.y, r: 15, color: 'yellow' },
        { isStatic: false, restitution: 0.9, label: 'Murmel' });
      blocks.push(ball);
    }
    isDrag = false;
  });

  // Hier wird registriert, ob die Murmel mit etwas kollidiert und
  // dann die trigger-Funktion des getroffenen Blocks ausgelöst
  // Dieser Code ist DON'T TOUCH IT - wenn das Bewdürfnis besteht, bitte mit Benno reden!!!
  Events.on(engine, 'collisionStart', function (event) {
    var pairs = event.pairs;
    pairs.forEach((pair, i) => {
      if (pair.bodyA.label == 'Murmel') {
        pair.bodyA.plugin.block.collideWith(pair.bodyB.plugin.block)
      }
      if (pair.bodyB.label == 'Murmel') {
        pair.bodyB.plugin.block.collideWith(pair.bodyA.plugin.block)
      }
    })
  })

  Events.on(engine, 'collisionActive', function (event) {
    var pairs = event.pairs;
    pairs.forEach((pair, i) => {
      if (pair.bodyA.label == 'Murmel' && pair.bodyB.label == 'Active') {
        pair.bodyA.plugin.block.collideWith(pair.bodyB.plugin.block)
      }
      if (pair.bodyB.label == 'Murmel' && pair.bodyA.label == 'Active') {
        pair.bodyB.plugin.block.collideWith(pair.bodyA.plugin.block)
      }
    })
  })

  // Die Murmelbahn erzeugen
  createScene();
  // Den Motor von Matter starten: die Physik wird berechnet
  Runner.run(engine);
}

function createScene() {
  // create some blocks 
  blocks.push(new BlockCore(
    world,
    { x: windowWidth / 2, y: 800, w: windowWidth, h: 80, color: 'gray' },
    { isStatic: true }
  ));

  blocks.push(new BlockCore(
    world,
    { x: 0, y: 450, w: 800, h: 40, color: 'lightgray' },
    { angle: PI / 3, isStatic: true }
  ));

  blocks.push(new BlockCore(
    world,
    { x: windowWidth, y: 450, w: 800, h: 40, color: 'lightgray' },
    { angle: -PI / 3, isStatic: true }
  ));

  // Trampolin oder Fliessband
  blocks.push(new BlockCore(
    world,
    { x: 500, y: 780, w: 400, h: 40, color: 'red', force: { x: -0.02, y: 0.0 } },
    { isStatic: true, label: 'Active' }
  ));

  // Mover
  blocks.push(new Mover(
    world,
    { x: 500, y: 300, w: 100, h: 10, color: 'olive', dir: { x: 0, y: 1 }, min: { x: 0, y: 100 }, max: { x: 0, y: 400 } },
    { isStatic: true }
  ));

  // Propeller
  blocks.push(new Propeller(
    world,
    { x: 200, y: 300, w: 400, h: 5, color: 'olive' },
    { isStatic: true }
  ));

  blocks.push(new BlockCore(
    world,
    { x: windowWidth / 2, y: 450, w: 400, h: 10, color: 'yellow' },
    { angle: -PI / 7, isStatic: true }
  ));

  // Die Murmel hat das label "Murmel" verursacht Kollisionen, die die trigger-Funktion
  // des getroffene Blocks auslöst 
  murmel = new Ball(
    world,
    { x: 100, y: 300, r: 30, color: 'magenta' },
    { label: "Murmel", restitution: 0.9, friction: 0.0, frictionAir: 0.0 }
  )
  blocks.push(murmel);

  // Der blaue Block hat eine trigger-Funktion die durch Kontakt mit der "Murmel" ausgelöst wird
  blocks.push(new BlockCore(
    world,
    {
      x: 200, y: 200, w: 60, h: 60, color: 'blue',
      trigger: (ball, block) => {
        // change p5js attributes der Murmel
        ball.attributes.color = color(Math.random() * 255, Math.random() * 256, Math.random() * 256);
      }
    },
    { isStatic: false, density: 0.5 }
  ));
}

function draw() {
  background(0, 60);
  blocks.forEach(block => block.draw());
  mouse.draw();
}
