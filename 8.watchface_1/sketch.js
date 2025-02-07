Matter.use('matter-wrap');

let handSec;
let handMin;
let handHour;
let circles = [];
let mouse;
let center;
let engine;
let mySound;
let prevMinute = -1;


function preload() {
  mySound = loadSound('732943__moodyfingers__hand-crank-music-box-g5-note.flac');
}

function setup() {
  const canvas = createCanvas(960, 960);
  center = { x: width / 2, y: height / 2 };

  // create an engine
  engine = Matter.Engine.create();
  let world = engine.world;

  // Set gravity for bouncing effects
  engine.world.gravity.x = 0.0;
  engine.world.gravity.y = 0.0;
  // Create the canvas boundary (frame)
  createFrame(world);

  // Handles of the clock
  handMin = new Block(world, { w: 35, h: 400, x: center.x, y: center.y - 200, color: '#F6D110' }, { isStatic: true });
  handSec = new Block(world, { w: 18, h: 450, x: center.x, y: center.y - 225, color: 'white' }, { isStatic: true });
  handHour = new Block(world, { w: 35, h: 300, x: center.x, y: center.y - 150, color: 'white' }, { isStatic: true });

  // Add a mouse to manipulate Matter objects
  mouse = new Mouse(engine, canvas, { stroke: 'magenta', strokeWeight: 2 });

  // Run the engine
  Matter.Runner.run(engine);
}

let lastSoundTime = 0; // Speichert den letzten Frame des Sounds

function draw() {
  background('#141414');

  const angleMin = map(minute(), 0, 60, 0, TWO_PI);
  const angleSec = map(second(), 0, 60, 0, TWO_PI);
  const angleHour = map(hour(), 0, 12, 0, TWO_PI);

  handMin.rotate(angleMin, { x: center.x, y: center.y });
  handSec.rotate(angleSec, { x: center.x, y: center.y });
  handHour.rotate(angleHour, { x: center.x, y: center.y });

  let tx, ty;
  strokeWeight(35);
  stroke(handMin.attributes.color);
  tx = center.x + 2 * (handMin.body.position.x - center.x);
  ty = center.y + 2 * (handMin.body.position.y - center.y);
  line(center.x, center.y, tx, ty);

  stroke(handHour.attributes.color);
  tx = center.x + 2 * (handHour.body.position.x - center.x);
  ty = center.y + 2 * (handHour.body.position.y - center.y);
  line(center.x, center.y, tx, ty);

  strokeWeight(20);
  stroke(handSec.attributes.color);
  tx = center.x + 2 * (handSec.body.position.x - center.x);
  ty = center.y + 2 * (handSec.body.position.y - center.y);
  line(center.x, center.y, tx, ty);

  updateCircles();
  let ping = false;
  
  for (let circle of circles) {
    circle.draw();
    if (Matter.Collision.collides(circle.body, handSec.body)) {
      ping = true;
    }
  }

  // Sound nur spielen, wenn seit dem letzten Abspielen mindestens 40 Frames vergangen sind
  if (ping && frameCount - lastSoundTime > 40) {
    mySound.play();
    lastSoundTime = frameCount; // Speichert den Frame des letzten Sounds
  }

  engine.gravity.x = (rotationY / 2 - engine.gravity.x) * 0.5;
  engine.gravity.y = (rotationX / 2 - engine.gravity.y) * 0.5;

  mouse.draw();
}


function updateCircles() {
  const world = engine.world;
  const currentMinute = minute();
  
  // Remove excess circles if too many
  while (circles.length > currentMinute) {
    let circle = circles.pop();
    Matter.World.remove(world, circle.body);
  }

  // Add new circles if too few
  while (circles.length < currentMinute) {
    let radius = random(30, 30); // Define a random radius for circles
    let newCircle = new Circle(world,
      { x: random(0, 960), y: random(0, 960), r: radius, color: '#F6D110' },
      {
        friction: 1.0,      // Minimize friction for strong bouncing
        frictionAir: 0.1,  // Minimal air resistance
        restitution: 0.5,   // Super bouncy circles
      }
    );
    circles.push(newCircle);
  }
}

function createFrame(world) {
  const thickness = 200; // Thickness of the frame
  const options = {
    isStatic: true,
    restitution: 1.0, // High restitution for bouncing
    friction: 0.0 // Minimize friction for smooth bounces
  };

  // Top boundary
  Matter.World.add(world, Matter.Bodies.rectangle(width / 2, 0 - thickness / 2, width, thickness, options));
  // Bottom boundary
  Matter.World.add(world, Matter.Bodies.rectangle(width / 2, height + thickness / 2, width, thickness, options));
  // Left boundary
  Matter.World.add(world, Matter.Bodies.rectangle(0 - thickness / 2, height / 2, thickness, height, options));
  // Right boundary
  Matter.World.add(world, Matter.Bodies.rectangle(width + thickness / 2, height / 2, thickness, height, options));
}


// Define a new class for circles
class Circle {
  constructor(world, options, bodyOptions) {
    this.r = options.r;
    this.color = options.color;
    this.body = Matter.Bodies.circle(options.x, options.y, this.r, bodyOptions);
    Matter.World.add(world, this.body);
  }

  draw() {
    fill(this.color);
    noStroke();
    const pos = this.body.position;
    ellipse(pos.x, pos.y, this.r * 2);
  }
} 