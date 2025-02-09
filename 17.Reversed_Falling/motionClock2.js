// --- Import Matter.js ---
const { Engine, World, Bodies, Body, Vector } = Matter;

let engine; // Physics engine
let world; // Physics world
let hours = []; // Array to store hour markers
let minutes = []; // Array to store minute markers
let seconds = []; // Array to store second markers
let center; // Center circle representing the core of the clock
const radiusHours = 200; // Reduced radius for hours ring
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

  // Create 12 hour circles orbiting the center (no rotation anymore)
  for (let i = 0; i < numHours; i++) {
    const angle = (TWO_PI / numHours) * i; // Calculate angle for each circle
    const x = centerX + radiusHours * cos(angle);
    const y = centerY + radiusHours * sin(angle);

    const circle = Bodies.circle(x, y, 15, {
      restitution: 0.9, // Make circles slightly bouncy
      frictionAir: 0.01, // Add a bit of air resistance
      isStatic: true, // No movement for hour markers
    });

    World.add(world, circle);
    hours.push({ body: circle });
  }

  // Create 60 minute circles orbiting the center (no rotation anymore)
  for (let i = 0; i < numMinutes; i++) {
    const angle = (TWO_PI / numMinutes) * i; // Calculate angle for each minute circle
    const x = centerX + radiusMinutes * cos(angle);
    const y = centerY + radiusMinutes * sin(angle);

    const circle = Bodies.circle(x, y, 12, {
      restitution: 0.9, // Make circles slightly bouncy
      frictionAir: 0.01, // Add a bit of air resistance
      isStatic: true, // No movement for minute markers
    });

    World.add(world, circle);
    minutes.push({ body: circle });
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
  background(0); // Black background

  // Update the physics engine
  Engine.update(engine);

  // Get the current time
  const currentHour = hour() % 12; // Current hour (in 12-hour format)
  const currentMinute = minute(); // Current minute
  const currentSecond = second(); // Current second

  // Display the current time in the center
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(48);
  text(`${nf(currentHour === 0 ? 12 : currentHour, 2)}:${nf(currentMinute, 2)}:${nf(currentSecond, 2)}`, centerX, centerY);

  // Draw hour markers (no rotation, fixed positions)
  for (let i = 0; i < hours.length; i++) {
    const circleData = hours[i];
    const circleBody = circleData.body;

    // Highlight circles up to the current hour
    if (i < currentHour) {
      fill('#FF0000'); // Highlight color (red)
    } else {
      fill(150); // Grey for inactive hours
    }

    // Draw the hour circle
    circle(circleBody.position.x, circleBody.position.y, 30);
  }

  // Draw minute markers (no rotation, fixed positions)
  for (let i = 0; i < minutes.length; i++) {
    const circleData = minutes[i];
    const circleBody = circleData.body;

    fill('#FF0000'); // Green for minute circles
    circle(circleBody.position.x, circleBody.position.y, 24); // Slightly larger size
  }

  // Draw second markers (falling effect, but no moon gravity)
  for (let i = 0; i < seconds.length; i++) {
    const circleData = seconds[i];
    const circleBody = circleData.body;

    // Apply normal gravity to all falling second circles
    if (i < currentSecond) {
      // Once the current second has passed, make these dynamic
      Body.setStatic(circleBody, false); // Make the circle dynamic

      fill('#FF0000'); // Highlight in red
    } else {
      fill(150); // Grey for other second circles
    }

    // Draw the second circle
    circle(circleBody.position.x, circleBody.position.y, 16); // Smallest size
  }

  // After first set of seconds have fallen, keep allowing them to fall in real-time
  if (currentSecond === 0 && !firstFallDone) {
    firstFallDone = true; // Mark first fall as done
  }
}
