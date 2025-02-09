// --- Import Matter.js ---
const { Engine, World, Bodies, Body, Vector } = Matter;

let engine; // Physics engine
let world; // Physics world
let hours = []; // Array to store hour markers
let minutes = []; // Array to store minute markers
let seconds = []; // Array to store second markers
let center; // Center circle representing the core of the clock
const radiusHours = 150; // Reduced radius for hours ring (75% of original 200)
const radiusMinutes = 250; // Radius of the orbit for minutes
const radiusSeconds = 350; // Radius of the orbit for seconds
const numHours = 12; // Number of hour markers
const numMinutes = 59; // Number of minute markers (one less than 60)
const numSeconds = 59; // Number of second markers (one less than 60)
let centerX, centerY; // Center of the canvas
let firstFallDone = false; // Flag to control first fall behavior
let currentSecondAtStart = 0; // To store the current second at the start

// Dimensions of the invisible boundary (the screen)
const screenWidth = 960;
const screenHeight = 960;
const boundaryThickness = 100; // Thickness of the boundary

// Touch feedback circle variables
let touchCircle = null;
let touchCircleTimer = 0; // Timer to fade out touch circle

function setup() {
  createCanvas(screenWidth, screenHeight);
  centerX = width / 2;
  centerY = height / 2;

  engine = Engine.create(); // Create the physics engine
  world = engine.world;

  engine.world.gravity.y = 1; // Normal gravity

  // Create the center circle (static body, but invisible, bigger and grey)
  center = Bodies.circle(centerX, centerY, 40, {
    isStatic: true,
    render: { fillStyle: 'grey' },
  });
  World.add(world, center);

  // Create 12 hour circles orbiting the center
  for (let i = 0; i < numHours; i++) {
    const angle = (TWO_PI / numHours) * i;
    const x = centerX + radiusHours * cos(angle);
    const y = centerY + radiusHours * sin(angle);

    const circle = Bodies.circle(x, y, 30, {
      restitution: 0.9,
      frictionAir: 0.01,
      isStatic: true,
    });

    World.add(world, circle);
    hours.push({ body: circle, placeholder: { x, y, r: 30 } });
  }

  // Create 59 minute circles orbiting the center (59 instead of 60)
  for (let i = 0; i < numMinutes; i++) {
    const angle = (TWO_PI / numMinutes) * i - PI / 2;
    const x = centerX + radiusMinutes * cos(angle);
    const y = centerY + radiusMinutes * sin(angle);

    const circle = Bodies.circle(x, y, 12, {
      restitution: 0.9,
      frictionAir: 0.01,
      isStatic: true,
    });

    World.add(world, circle);
    minutes.push({ body: circle, fallen: false, placeholder: { x, y, r: 12 } });
  }

  // Create 59 second circles orbiting the center (59 instead of 60)
  for (let i = 0; i < numSeconds; i++) {
    const angle = (TWO_PI / numSeconds) * i - PI / 2;
    const x = centerX + radiusSeconds * cos(angle);
    const y = centerY + radiusSeconds * sin(angle);

    const circle = Bodies.circle(x, y, 8, {
      restitution: 0.9,
      frictionAir: 0.05,
      isStatic: true,
    });

    World.add(world, circle);
    seconds.push({ body: circle, fallen: false, placeholder: { x, y, r: 8 } });
  }

  currentSecondAtStart = second();

  const boundaryOptions = {
    isStatic: true,
    render: { visible: false },
  };

  const leftBoundary = Bodies.rectangle(0, screenHeight / 2, boundaryThickness, screenHeight, boundaryOptions);
  const rightBoundary = Bodies.rectangle(screenWidth, screenHeight / 2, boundaryThickness, screenHeight, boundaryOptions);
  const topBoundary = Bodies.rectangle(screenWidth / 2, 0, screenWidth, boundaryThickness, boundaryOptions);
  const bottomBoundary = Bodies.rectangle(screenWidth / 2, screenHeight, screenWidth, boundaryThickness, boundaryOptions);

  World.add(world, [leftBoundary, rightBoundary, topBoundary, bottomBoundary]);
}

function draw() {
  background(0, 25);

  engine.gravity.x = (rotationY / 2 - engine.gravity.x) * 0.5;
  engine.gravity.y = (rotationX / 2 - engine.gravity.y) * 0.5;

  Engine.update(engine);

  // Draw placeholders for all markers
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

  // Draw hour markers
  for (let i = 0; i < hours.length; i++) {
    fill(i < hour() % 12 ? '#FF0000' : 150);
    noStroke();
    circle(hours[i].body.position.x, hours[i].body.position.y, 60);
  }

  // Draw minute markers (59 instead of 60)
  for (let i = 0; i < minutes.length; i++) {
    // if (i === 0) {
    //   Body.setStatic(minutes[i].body, true);
    // } else 
    if (i <= minute() && !minutes[i].fallen) {
      Body.setStatic(minutes[i].body, false);
      minutes[i].fallen = true;
    }

    fill(minutes[i].fallen ? (i % 5 === 0 ? '#FF0000' : 255) : '#333333');
    noStroke();
    circle(minutes[i].body.position.x, minutes[i].body.position.y, 24);
  }

  // Draw second markers (59 instead of 60)
  for (let i = 0; i < seconds.length; i++) {
    // if (i === 0) {
    //   if (second() === 59) {
    //     fill('#FFFFFF'); // 0th second turns active at 60
    //   } else {
    //     fill(150); // Keep it inactive
    //   }
    // } else 
    if (i <= second()) {
      Body.setStatic(seconds[i].body, false);
      seconds[i].fallen = true;
      fill('#FFFFFF');
    // } else {
    //   fill(150);
    }

    noStroke();
    circle(seconds[i].body.position.x, seconds[i].body.position.y, 16);
  }

  // Touch feedback for user interaction
  if (touchCircle !== null) {
    fill(255, 0, 0, touchCircle.alpha);
    noStroke();
    circle(touchCircle.x, touchCircle.y, touchCircle.size);

    touchCircle.alpha -= 5;
    if (touchCircle.alpha <= 0) {
      touchCircle = null;
    }
  }
}

function touchStarted() {
  touchCircle = {
    x: mouseX,
    y: mouseY,
    size: 30,
    alpha: 255,
  };

  touchCircleTimer = millis();
}

function touchEnded() {}
