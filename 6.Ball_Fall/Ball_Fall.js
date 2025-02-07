// Set up Matter.js modules
const { Engine, Render, Runner, World, Bodies, Constraint, Events, Body } = Matter;


// Create the main engine
const engine = Engine.create();
const world = engine.world;
world.gravity.y = 0.85;


// Create the first renderer (main canvas)
const renderMain = Render.create({
    element: document.body,
    engine: engine,
    canvas: document.getElementById('matter'),
    options: {
        width: 660,
        height: 960,
        wireframes: false,
        background: 'black'
    }
});
Render.run(renderMain);

// Create a runner
const runner = Runner.create();
Runner.run(runner, engine);

// Variable to track the first ball
let firstBall = null;

// Variable to control viewport toggle
let viewportEnabled = true;

// Variable to track whether the simulation is paused
let isPaused = false;

// Function to create a rectangle nailed to a point
function createNailedRectangle(x, y, width, height, angle) {
    const rect = Bodies.rectangle(x, y, width, height, {
        render: {
            fillStyle: '#5A5A5A',
            lineWidth: 1,
            strokeStyle: 'black'
        },
    });
    Body.setAngle(rect, angle * (Math.PI / 180)); // Set the starting angle in radians
    const constraint = Constraint.create({
        pointA: { x, y },
        bodyB: rect,
        pointB: { x: 0, y: 0 },
    });
    rect.isFilled = false; // Custom property to track if the rectangle is filled
    rect.originalAngle = rect.angle; // Store the original angle
    World.add(world, [rect, constraint]);
    return rect;
}

// Create multiple nailed rectangles with alternating rows of 3 and 2 rectangles
const rectWidth = 200;
const rectHeight = 10;
const rows = 90;
const spacingX = 220; // Spacing between columns
const spacingY = 160; // Spacing between rows
const startXThree = [90, 330, 560]; // Positions for 3 rectangles in a row
const startXTwo = [190, 470]; // Positions for 2 rectangles in a row
const angles = [-45, -30, 30, 45]; // Possible random angles for rectangles

const rectangles = [];
for (let i = 0; i < rows; i++) {
    const startX = i % 2 === 0 ? startXThree : startXTwo;
    startX.forEach(x => {
        const randomAngle = angles[Math.floor(Math.random() * angles.length)]; // Pick a random angle
        rectangles.push(createNailedRectangle(x, 80 + i * spacingY, rectWidth, rectHeight, randomAngle));
    });
}

// Function to create a ball
function createBall(isFirst = false, color = 'gray', xPosition = Math.random() * 660) {
    const radius = isFirst ? 20 : 15; // First ball is larger

    const ball = Bodies.circle(xPosition, 0, radius, {
        restitution: isFirst ? 1.3 : 0.5, // Make the first ball more bouncy
        render: {
            fillStyle: color
        }
    });
    World.add(world, ball);

    // Apply random horizontal velocity to make the green ball move around more
    if (isFirst) {
        Body.setVelocity(ball, {
            x: (Math.random() - 0.2) * 0, // Random horizontal velocity [-2.5, 2.5]
            y: 0
        });
    }

 

    // Set the first ball if it doesn't exist yet
    if (isFirst) {
        firstBall = ball;
    }
}

// Event listener for "Space" key to pause or resume the simulation
window.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        isPaused = !isPaused;
        if (isPaused) {
            Runner.stop(runner);
        } else {
            Runner.run(runner, engine);
        }
    }
});

// Create the initial  ball
createBall(true, '#ca336d');

// Function to reset the pink ball every 60 seconds
setInterval(() => {
    if (firstBall) {
        World.remove(world, firstBall); // Remove the current pink ball
    }
    createBall(true, '#ca336d', 330); // Create a new pink ball at the starting position
}, 60000);


// Add event listener for clicking to create additional gray balls
window.addEventListener('click', () => {
    createBall();
});

// Create walls around the first canvas
const wallThickness = 10;
const walls = [
    Bodies.rectangle(-wallThickness / 6, 0, wallThickness, 96000, { 
        isStatic: true, 
        render: { fillStyle: 'black' } // Set wall color to black
    }), // Left wall
    Bodies.rectangle(660 + wallThickness / 6, 0, wallThickness, 96000, { 
        isStatic: true, 
        render: { fillStyle: 'black' } // Set wall color to black
    }) // Right wall
];
World.add(world, walls);

// Detect collisions and fill rectangles, then revert color after 3 seconds
Events.on(engine, 'collisionStart', (event) => {
    const pairs = event.pairs;
    pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;

        rectangles.forEach(rect => {
            if ((bodyA === rect || bodyB === rect) && !rect.isFilled) {
                const originalColor = rect.render.fillStyle; // Store original color
                rect.render.fillStyle = 'white'; // Fill rectangle with white color
                rect.isFilled = true; // Mark the rectangle as filled
                
                // Revert color after 3 seconds
                setTimeout(() => {
                    rect.render.fillStyle = originalColor; // Restore original color
                }, 3500);
            }
        });
    });
});


// Continuously adjust rectangles to return to their original angle
Events.on(engine, 'beforeUpdate', () => {
    rectangles.forEach(rect => {
        const angleDifference = rect.originalAngle - rect.angle;
        rect.torque = angleDifference * 0.01; // Apply reduced torque to make it harder to rotate
    });
});


// Update the viewport to follow the first ball
Events.on(engine, 'afterUpdate', () => {
    if (viewportEnabled && firstBall) {
        const ballPosition = firstBall.position;
        renderMain.bounds.min.y = ballPosition.y - 480; // Center the ball vertically in the viewport
        renderMain.bounds.max.y = ballPosition.y + 480;

        // Ensure the bounds do not exceed the world limits
        renderMain.bounds.min.y = Math.max(0, renderMain.bounds.min.y);
        renderMain.bounds.max.y = Math.min(96000, renderMain.bounds.max.y);

        // Update the render view transform
        Render.lookAt(renderMain, {
            min: renderMain.bounds.min,
            max: renderMain.bounds.max
        });
    } else if (!viewportEnabled) {
        renderMain.options.hasBounds = false; // Disable viewport bounds to make it scrollable
    }
});

// Function to handle ball explosion at the start of every new minute
function explodeBall() {
    if (firstBall) {
        // Create multiple small fragments around the pink ball's position
        const fragments = [];
        const numFragments = 20;
        const explosionForce = 10;
        
        for (let i = 0; i < numFragments; i++) {
            const fragment = Bodies.circle(firstBall.position.x, firstBall.position.y, 5, {
                render: { fillStyle: '#ca336d' },
                restitution: 0.8
            });
            
            // Apply a random force to each fragment
            const angle = Math.random() * Math.PI * 2;
            const force = {
                x: Math.cos(angle) * explosionForce,
                y: Math.sin(angle) * explosionForce
            };
            Body.setVelocity(fragment, force);
            
            fragments.push(fragment);
        }
        
        // Remove the original pink ball
        World.remove(world, firstBall);
        firstBall = null;
        
        // Add fragments to the world
        World.add(world, fragments);

        // Restart the ball after a short delay
        setTimeout(() => {
            createBall(true, '#ca336d', 330); // Create a new pink ball at the starting position
        }, 1000); // Delay before respawning
    }
}

// Check every second if the current second is 0 (start of a new minute)
setInterval(() => {
    const currentSeconds = new Date().getSeconds();
    if (currentSeconds === 0) {
        explodeBall();
    }
}, 1000);

function setup() {
    const canvas = createCanvas(330, 960);
    canvas.parent('p5');
    noStroke();
  }
  
  function draw() {
    background(0);
    let currentHour = hour() %13 // Convert to 12-hour format
    let currentMinute = minute();
    
    let circleSizeLarge = 68; // Size of large circles (hours)
    let circleSizeSmall = 35; // Size of small circles (minutes)
    let spacingLarge = 75; // Spacing for large circles
    let spacingSmall = 45; // Spacing for small circles
    let startX = 40;
    let startY = 50;
    
    // Draw hour circles
    for (let i = 0; i < 12; i++) {
      let y = startY + i * spacingLarge;
      fill(i <= currentHour ? color(199, 51, 107) : 90);
      ellipse(startX, y, circleSizeLarge);
    }    
// Draw minute circles
    for (let i = 0; i < 12; i++) {
      let y = startY + i * spacingLarge;
      for (let j = 0; j < 5; j++) {
        let x = startX + 70 + j * spacingSmall;
        let minuteIndex = i * 5 + j;
        fill(minuteIndex < currentMinute ? color(199, 51, 107) : 90);
        ellipse(x, y, circleSizeSmall);
      }
    }
  }