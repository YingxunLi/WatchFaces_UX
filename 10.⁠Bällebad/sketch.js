// Matter.js Module
let Engine = Matter.Engine,
  World = Matter.World,
  Bodies = Matter.Bodies;

let engine, world;
let whiteCircles = []; 
let greyCircles = [];   
let orangeCircles = []; 

let ground, leftWall, rightWall, ceiling;

let lastSecond = -1;
let whiteCount = 0; // gefallene weiße Kreise
let greyCount = 0;  // graue Kreise

function setup() {
  createCanvas(960, 960);

  engine = Engine.create();
  world = engine.world;

  ground = Bodies.rectangle(width / 2, height + 10, width, 30, { isStatic: true });
  leftWall = Bodies.rectangle(-10, height / 2, 20, height, { isStatic: true });
  rightWall = Bodies.rectangle(width + 10, height / 2, 30, height, { isStatic: true });
  ceiling = Bodies.rectangle(width / 2, -10, width, 30, { isStatic: true });

  World.add(world, [ground, leftWall, rightWall]);

  syncWithTime();
}

function draw() {
  background('#545454');

  Engine.update(engine);

  let currentTime = new Date();
  let seconds = currentTime.getSeconds();

  // Prüfen, ob eine neue Sekunde erreicht wurde
  if (seconds !== lastSecond) {
    addWhiteCircle(); // weiße Kugel wird hinzugefügt
    lastSecond = seconds;
  }

  drawCircles(whiteCircles, 'lightgrey'); 
  drawCircles(greyCircles, '#87CEFA');  
  drawCircles(orangeCircles, '#545454', true); // Stundenkreise mit blauem Stroke
}

function drawCircles(circles, fillColor, isHourCircle = false) {
  fill(fillColor);
  if (isHourCircle) {
    stroke('#87CEFA');
    strokeWeight(8); // Setzt die Stroke-Farbe der Stundenkreise auf Blau
  } else {
    noStroke();
  }
  
  for (let circle of circles) {
    let pos = circle.position;
    ellipse(pos.x, pos.y, circle.circleRadius * 2);
  }
}

function syncWithTime() {
  let currentTime = new Date();
  let hours = currentTime.getHours() % 12 || 12; // Umstellung auf 12-Stunden-System
  let minutes = currentTime.getMinutes();
  let seconds = currentTime.getSeconds();

  for (let i = 0; i < seconds; i++) {
    let circle = Bodies.circle(random(width), random(0, height / 2), 15, {
      restitution: 0.7,
    });
    whiteCircles.push(circle);
    World.add(world, circle);
  }
  whiteCount = seconds; // zählt ab aktueller Sekundenzahl 

  for (let i = 0; i < minutes; i++) {
    let circle = Bodies.circle(random(width), random(0, height / 2), 50, {
      restitution: 0.7,
    });
    greyCircles.push(circle);
    World.add(world, circle);
  }
  greyCount = minutes; // zählt ab aktueller Sekundenzahl

  for (let i = 0; i < hours; i++) {
    let circle = Bodies.circle(random(width), random(0, height / 2), 100, {
      restitution: 0.7,
    });
    orangeCircles.push(circle);
    World.add(world, circle);
  }
}

function addWhiteCircle() {
  let circle = Bodies.circle(random(width), 0, 15, {
    restitution: 0.7,
    density: 0.5
  });
  whiteCircles.push(circle);
  World.add(world, circle);
  whiteCount++;

  if (whiteCount >= 60) {
    for (let circle of whiteCircles) {
      World.remove(world, circle);
    }
    whiteCircles = [];
    whiteCount = 0;

    addGreyCircle();
  }
}

function addGreyCircle() {
  let circle = Bodies.circle(random(width), 0, 50, {
    restitution: 0.7,
    density: 0.7
  });
  greyCircles.push(circle);
  World.add(world, circle);
  greyCount++;

  if (greyCount >= 60) {
    for (let circle of greyCircles) {
      World.remove(world, circle);
    }
    greyCircles = [];
    greyCount = 0;

    addOrangeCircle();
  }
}

function addOrangeCircle() {
  let circle = Bodies.circle(random(width), 0, 100, {
    restitution: 0.7,
    density: 0.7
  });
  orangeCircles.push(circle);
  World.add(world, circle);
}
