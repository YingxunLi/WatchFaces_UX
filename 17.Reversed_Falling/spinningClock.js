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

function setup() {
  createCanvas(960, 960);
  centerX = width / 2;
  centerY = height / 2;

  engine = Engine.create(); // Create the physics engine
  world = engine.world;

  // Set moon gravity (1/6th of Earth's gravity)
  engine.world.gravity.y = 0.16; // Moon gravity

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

    const circle = Bodies.circle(x, y, 15, {
      restitution: 0.9, // Make circles slightly bouncy
      frictionAir: 0.01, // Add a bit of air resistance
    });

    World.add(world, circle);
    hours.push({ body: circle, angle });
  }

  // Create 60 minute circles orbiting the center inside the "hours" ring
  for (let i = 0; i < numMinutes; i++) {
    const angle = (TWO_PI / numMinutes) * i; // Calculate angle for each minute circle
    const x = centerX + radiusMinutes * cos(angle);
    const y = centerY + radiusMinutes * sin(angle);

    const circle = Bodies.circle(x, y, 12, {
      restitution: 0.9, // Make circles slightly bouncy
      frictionAir: 0.01, // Add a bit of air resistance
    });

    World.add(world, circle);
    minutes.push({ body: circle, angle });
  }

  // Create 60 second circles stationary on the outer ring
  for (let i = 0; i < numSeconds; i++) {
    const angle = (TWO_PI / numSeconds) * i; // Calculate angle for each second circle
    const x = centerX + radiusSeconds * cos(angle);
    const y = centerY + radiusSeconds * sin(angle);

    const circle = Bodies.circle(x, y, 8, {
      restitution: 0.9, // Make circles slightly bouncy
      frictionAir: 0.05, // Add more air resistance for smoother bounce
      isStatic: true, // Initially set to stationary (static)
    });

    World.add(world, circle);
    seconds.push({ body: circle, angle });
  }

  // Set the current second at the start (for falling circles)
  currentSecondAtStart = second(); // Get the current second at the start
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

  // Draw orbiting hour markers
  for (let i = 0; i < hours.length; i++) {
    const circleData = hours[i];
    const circleBody = circleData.body;

    // Highlight circles up to the current hour
    if (i < currentHour) {
      fill('#FF0000'); // Highlight color (red)
    } else {
      fill(150); // Grey for inactive hours
    }

    // Calculate new position based on the actual hour
    const hourFraction = (currentMinute + currentSecond / 60) / 60; // Fraction of the current hour passed
    const newAngle = (TWO_PI / numHours) * (i + hourFraction); // Gradual position
    const targetX = centerX + radiusHours * cos(newAngle);
    const targetY = centerY + radiusHours * sin(newAngle);

    // Update position of the circle
    Body.setPosition(circleBody, { x: targetX, y: targetY });
    circleData.angle = newAngle;

    // Draw the hour circle
    circle(circleBody.position.x, circleBody.position.y, 30);
  }

  // Draw orbiting minute markers
  for (let i = 0; i < minutes.length; i++) {
    const circleData = minutes[i];
    const circleBody = circleData.body;

    // Calculate smoother new position based on the actual minute and second
    const totalTimeInSeconds = currentMinute * 60 + currentSecond; // Total seconds passed in the current minute
    const minuteFraction = totalTimeInSeconds / 3600; // Fraction of the hour passed, more smooth
    const newAngle = (TWO_PI / numMinutes) * (i + minuteFraction); // Gradual position with smoothness
    const targetX = centerX + radiusMinutes * cos(newAngle);
    const targetY = centerY + radiusMinutes * sin(newAngle);

    // Update position of the minute circle
    Body.setPosition(circleBody, { x: targetX, y: targetY });
    circleData.angle = newAngle;

    // Draw the minute circle
    fill('#FF0000'); // Green for minute circles
    circle(circleBody.position.x, circleBody.position.y, 24); // Slightly larger size
  }

  // Draw second markers with moon gravity effect
  for (let i = 0; i < seconds.length; i++) {
    const circleData = seconds[i];
    const circleBody = circleData.body;

    // Apply moon gravity (falling effect) to the first `currentSecond` number of circles
    if (i < currentSecond) {
      // Once the current second has passed, make these dynamic and apply force to simulate gravity
      Body.setStatic(circleBody, false); // Make the circle dynamic

      // Apply a small, slow downward force to simulate falling (moon gravity)
     // Body.applyForce(circleBody, circleBody.position, { x: 0, y: 0.002 }); // Apply small force downwards

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
