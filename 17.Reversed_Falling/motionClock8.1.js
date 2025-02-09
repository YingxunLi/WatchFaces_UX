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
const numMinutes = 60; // Number of minute markers
const numSeconds = 60; // Number of second markers
let centerX, centerY; // Center of the canvas
let firstFallDone = false; // Flag to control first fall behavior
let currentSecondAtStart = 0; // To store the current second at the start

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

  // Set normal gravity (remove moon gravity)
  engine.world.gravity.y = 1; // Normal gravity

  // Create the center circle (static body, but invisible, bigger and grey)
  center = Bodies.circle(centerX, centerY, 40, {
    isStatic: true,
    render: {
      fillStyle: 'grey', // Set the color to grey
    },
  });
  World.add(world, center);

  // Create 12 hour circles orbiting the center
  for (let i = 0; i < numHours; i++) {
    const angle = (TWO_PI / numHours) * i; // Calculate angle for each circle
    const x = centerX + radiusHours * cos(angle);
    const y = centerY + radiusHours * sin(angle);

    const circle = Bodies.circle(x, y, 30, { // Double the size (15 -> 30 radius)
      restitution: 0.9, // Make circles slightly bouncy
      frictionAir: 0.01, // Add a bit of air resistance
      isStatic: true, // No movement for hour markers
    });

    World.add(world, circle);
    hours.push({ body: circle });
  }

  // Create 60 minute circles orbiting the center (no rotation anymore)
  for (let i = 0; i < numMinutes; i++) {
    const angle = (TWO_PI / numMinutes) * i - PI / 2; // Rotate the minutes ring 90 degrees counter-clockwise
    const x = centerX + radiusMinutes * cos(angle);
    const y = centerY + radiusMinutes * sin(angle);

    const circle = Bodies.circle(x, y, 12, {
      restitution: 0.9, // Make circles slightly bouncy
      frictionAir: 0.01, // Add a bit of air resistance
      isStatic: true, // Initially set to stationary (static)
    });

    World.add(world, circle);
    minutes.push({ body: circle, fallen: false }); // Add 'fallen' property to track whether it has fallen
  }

  // Create 60 second circles stationary on the outer ring
  for (let i = 0; i < numSeconds; i++) {
    const angle = (TWO_PI / numSeconds) * i - PI / 2; // Rotate the seconds ring 90 degrees counter-clockwise
    const x = centerX + radiusSeconds * cos(angle);
    const y = centerY + radiusSeconds * sin(angle);

    const circle = Bodies.circle(x, y, 8, {
      restitution: 0.9, // Make circles slightly bouncy
      frictionAir: 0.05, // Add more air resistance for smoother bounce
      isStatic: true, // Initially set to stationary (static)
    });

    World.add(world, circle);
    seconds.push({ body: circle });
  }

  // Set the current second at the start (for falling circles)
  currentSecondAtStart = second(); // Get the current second at the start

  // Create an invisible boundary around the screen to prevent falling circles from going out of bounds
  const boundaryOptions = {
    isStatic: true, // Make the boundary static so it doesn't move
    render: {
      visible: false, // Make the boundary invisible
    },
  };

  // Create boundaries (invisible walls around the screen)
  const leftBoundary = Bodies.rectangle(0, screenHeight / 2, boundaryThickness, screenHeight, boundaryOptions);
  const rightBoundary = Bodies.rectangle(screenWidth, screenHeight / 2, boundaryThickness, screenHeight, boundaryOptions);
  const topBoundary = Bodies.rectangle(screenWidth / 2, 0, screenWidth, boundaryThickness, boundaryOptions);
  const bottomBoundary = Bodies.rectangle(screenWidth / 2, screenHeight, screenWidth, boundaryThickness, boundaryOptions);

  // Add the boundaries to the world
  World.add(world, [leftBoundary, rightBoundary, topBoundary, bottomBoundary]);
}

function draw() {
  // Hintergrund mit Transparenz: Schweif-Effekt
  background(0, 25); // Schwarzer Hintergrund mit Alpha-Wert (25)

  // Apply rotation of device to gravity
  engine.gravity.x = (rotationY / 2 - engine.gravity.x) * 0.5;
  engine.gravity.y = (rotationX / 2 - engine.gravity.y) * 0.5;

  // Update the physics engine
  Engine.update(engine);

  // Draw hour markers (fixed positions, no time text in center)
  for (let i = 0; i < hours.length; i++) {
    const circleData = hours[i];
    const circleBody = circleData.body;

    // Highlight circles up to the current hour
    if (i < hour() % 12) {
      fill('#FF0000'); // Highlight color (red)
    } else {
      fill(150); // Grey for inactive hours
    }

    // Draw the hour circle
    circle(circleBody.position.x, circleBody.position.y, 60); // Double the size
  }

  // Draw minute markers (no rotation, fixed positions)
  for (let i = 0; i < minutes.length; i++) {
    const circleData = minutes[i];
    const circleBody = circleData.body;

    // If the minute is active and hasn't fallen yet, make it fall
    if (i <= minute() && !circleData.fallen) {
      Body.setStatic(circleBody, false); // Make the circle dynamic
      circleData.fallen = true; // Mark this minute as fallen
    }

    // Update minute circle color based on whether it has fallen or not
    if (circleData.fallen) {
      if (i % 5 === 0) {
        fill('#FF0000'); // Red for every 5th minute circle
      } else {
        fill(255); // White for other minutes
      }
    } else {
      fill('#333333'); // Dark grey for inactive minutes
    }

    // Draw the minute circle
    circle(circleBody.position.x, circleBody.position.y, 24); // Slightly larger size
  }

  // Draw second markers (falling effect)
  for (let i = 0; i < seconds.length; i++) {
    const circleData = seconds[i];
    const circleBody = circleData.body;

    // Apply normal gravity to all falling second circles
    if (i < second()) {
      // Once the current second has passed, make these dynamic
      Body.setStatic(circleBody, false); // Make the circle dynamic

      fill('#FFFFFF'); // Highlight in white
    } else {
      fill(150); // Grey for other second circles
    }

    // Draw the second circle
    circle(circleBody.position.x, circleBody.position.y, 16); // Smallest size
  }
}
