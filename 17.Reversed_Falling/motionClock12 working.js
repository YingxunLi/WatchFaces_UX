// --- Import Matter.js ---
const { Engine, World, Bodies, Body, Vector } = Matter;

let engine; // Physics engine
let world; // Physics world
let hours = []; // Array to store hour markers
let minutes = []; // Array to store minute markers
let seconds = []; // Array to store second markers
let center; // Center circle representing the core of the clock
const radiusHours = 150; // Reduced radius for hours ring (75% of original 200)
const radiusMinutes = 300; // Radius of the orbit for minutes
const radiusSeconds = 400; // Radius of the orbit for seconds
const numHours = 12; // Number of hour markers
const numMinutes = 59; // Number of minute markers (changed to 59)
const numSeconds = 59; // Number of second markers (changed to 59)
let centerX, centerY; // Center of the canvas
let firstFallDone = false; // Flag to control first fall behavior
let lastMinute = -1; // Track last minute for second reset
let lastHour = -1; // Track last hour for minute reset

// Dimensions of the invisible boundary (the screen)
const screenWidth = 960;
const screenHeight = 960;
const boundaryThickness = 20; // Thickness of the boundary

function setup() {
  createCanvas(screenWidth, screenHeight);
  centerX = width / 2;
  centerY = height / 2;

  engine = Engine.create(); // Create the physics engine
  world = engine.world;

  engine.world.gravity.y = 1; // Normal gravity

  center = Bodies.circle(centerX, centerY, 40, { isStatic: true });
  World.add(world, center);

  createHourCircles();
  createMinuteCircles(); // Minuten bleiben bestehen
  createSecondCircles(); // Sekunden resetten jede Minute

  // Create boundaries (invisible walls around the screen)
  const boundaryOptions = { isStatic: true, render: { visible: false } };
  const leftBoundary = Bodies.rectangle(0, screenHeight / 2, boundaryThickness, screenHeight, boundaryOptions);
  const rightBoundary = Bodies.rectangle(screenWidth, screenHeight / 2, boundaryThickness, screenHeight, boundaryOptions);
  const topBoundary = Bodies.rectangle(screenWidth / 2, 0, screenWidth, boundaryThickness, boundaryOptions);
  const bottomBoundary = Bodies.rectangle(screenWidth / 2, screenHeight, screenWidth, boundaryThickness, boundaryOptions);
  World.add(world, [leftBoundary, rightBoundary, topBoundary, bottomBoundary]);
}

function createHourCircles() {
  for (let i = 0; i < numHours; i++) {
    const angle = (TWO_PI / numHours) * i;
    const x = centerX + radiusHours * cos(angle);
    const y = centerY + radiusHours * sin(angle);

    const circle = Bodies.circle(x, y, 30, { isStatic: true });
    World.add(world, circle);
    hours.push({ body: circle, placeholder: { x, y, r: 30 } });
  }
}

function createMinuteCircles() {
  minutes = [];

  for (let i = 0; i < numMinutes; i++) {
    const angle = (TWO_PI / numMinutes) * i - PI / 2;
    const x = centerX + radiusMinutes * cos(angle);
    const y = centerY + radiusMinutes * sin(angle);

    const circle = Bodies.circle(x, y, 12, { isStatic: true });
    World.add(world, circle);
    minutes.push({ body: circle, fallen: false, placeholder: { x, y, r: 12 } });
  }
}

function createSecondCircles() {
  seconds = [];

  for (let i = 0; i < numSeconds; i++) {
    const angle = (TWO_PI / numSeconds) * i - PI / 2;
    const x = centerX + radiusSeconds * cos(angle);
    const y = centerY + radiusSeconds * sin(angle);

    const circle = Bodies.circle(x, y, 8, { isStatic: true });
    World.add(world, circle);
    seconds.push({ body: circle, fallen: false, placeholder: { x, y, r: 8 } });
  }
}

function draw() {
  background(0, 25);
  Engine.update(engine);

  let currentMinute = minute();
  let currentHour = hour();

  // Reset Sekunden, wenn eine neue Minute beginnt
  if (currentMinute !== lastMinute) {
    resetSeconds();
    lastMinute = currentMinute;
  }

  // Reset Minuten, wenn eine neue Stunde beginnt
  if (currentHour !== lastHour) {
    resetMinutes();
    lastHour = currentHour;
  }

  drawPlaceholders();
  drawHourMarkers();
  drawMinuteMarkers();
  drawSecondMarkers();
}

function resetSeconds() {
  for (let i = 0; i < seconds.length; i++) {
    World.remove(world, seconds[i].body);
  }
  createSecondCircles();
}

function resetMinutes() {
  for (let i = 0; i < minutes.length; i++) {
    World.remove(world, minutes[i].body);
  }
  createMinuteCircles();
}

function drawPlaceholders() {
  for (let i = 0; i < hours.length; i++) {
    const { x, y, r } = hours[i].placeholder;
    fill(50, 50, 50, 50);
    noStroke();
    circle(x, y, r);
  }

  for (let i = 0; i < minutes.length; i++) {
    const { x, y, r } = minutes[i].placeholder;
    fill(50, 50, 50, 50);
    noStroke();
    circle(x, y, r);
  }

  for (let i = 0; i < seconds.length; i++) {
    const { x, y, r } = seconds[i].placeholder;
    fill(50, 50, 50, 50);
    noStroke();
    circle(x, y, r);
  }
}

function drawHourMarkers() {
  for (let i = 0; i < hours.length; i++) {
    const circleData = hours[i];
    const circleBody = circleData.body;

    if (i < hour() % 12) {
      fill('#FF0000');
    } else {
      fill(150);
    }

    noStroke();
    circle(circleBody.position.x, circleBody.position.y, 60);
  }
}

function drawMinuteMarkers() {
  for (let i = 0; i < minutes.length; i++) {
    const circleData = minutes[i];
    const circleBody = circleData.body;

    if (i <= minute() && !circleData.fallen) {
      Body.setStatic(circleBody, false);
      circleData.fallen = true;
    }

    if (circleData.fallen) {
      fill(i % 5 === 0 ? '#FF0000' : 255);
    } else {
      fill('#333333');
    }

    noStroke();
    circle(circleBody.position.x, circleBody.position.y, 24);
  }
}

function drawSecondMarkers() {
  for (let i = 0; i < seconds.length; i++) {
    const circleData = seconds[i];
    const circleBody = circleData.body;

    if (i < second()) {
      Body.setStatic(circleBody, false);
      circleData.fallen = true;
    }

    if (circleData.fallen) {
      fill(255);
    } else {
      fill(150);
    }

    noStroke();
    circle(circleBody.position.x, circleBody.position.y, 16);
  }
}
