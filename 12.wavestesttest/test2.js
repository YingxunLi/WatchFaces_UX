let Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies;

let engine, world;
let points = [];
let gravity;
let ball;
let fontSize = 300;
let fontGraphics;
let waveOffset = 0;
let waveSeedX, waveSeedY;
let followBall = false;
let changeLineColor = false;
let ballBody;

function setup() {
  createCanvas(600, 600);
  engine = Engine.create();
  world = engine.world;
  engine.gravity.y = 0;

  waveSeedX = random(1000);
  waveSeedY = random(1000);

  let spacing = 15;
  for (let x = spacing; x < width; x += spacing) {
    for (let y = spacing; y < height; y += spacing) {
      points.push({
        base: createVector(x, y),
        current: createVector(x, y),
        angle: random(TWO_PI),
        length: 10,
        isTimePart: false,
        blueIntensity: 0,
        strokeWeight: 2,
      });
    }
  }

  ball = {
    pos: createVector(width / 2, height / 2),
    radius: 50,
  };

  ballBody = Bodies.circle(ball.pos.x, ball.pos.y, ball.radius, {
    restitution: 0.8,
    friction: 0.01,
    frictionAir: 0.001,
  });

  World.add(world, ballBody);

  fontGraphics = createGraphics(width, height);
  fontGraphics.pixelDensity(1);
}

function draw() {
  background(0);
  Engine.update(engine, 1000 / 30); // Ensure iOS doesn't reduce refresh rate

  // Apply rotation of device to gravity
  engine.gravity.x = (rotationY / 2 - engine.gravity.x) * 0.5;  // Use rotationY
  engine.gravity.y = (rotationX / 2 - engine.gravity.y) * 0.5;  // Use rotationX
  
  // Move the ball to follow the mouse position
  Matter.Body.setPosition(ballBody, { x: mouseX, y: mouseY });

  // Limit the ball's position within canvas
  Matter.Body.setPosition(ballBody, {
    x: constrain(ballBody.position.x, ball.radius, width - ball.radius),
    y: constrain(ballBody.position.y, ball.radius, height - ball.radius),
  });

  gravity = createVector(ballBody.position.x, ballBody.position.y);

  let h = hour();
  let m = minute();

  fontGraphics.background(0);
  fontGraphics.fill(255);
  fontGraphics.textSize(fontSize);
  fontGraphics.textAlign(CENTER, CENTER);
  fontGraphics.text(nf(h, 2), width / 2, height / 4);
  fontGraphics.text(nf(m, 2), width / 2, (3 * height) / 4);
  fontGraphics.loadPixels();

  points.forEach((point) => {
    let dir = gravity.copy().sub(point.base);

    let px = floor(point.base.x);
    let py = floor(point.base.y);
    if (px >= 0 && px < width && py >= 0 && py < height) {
      let index = (py * width + px) * 4;
      point.isTimePart = fontGraphics.pixels[index] > 128;
    } else {
      point.isTimePart = false;
    }

    // Calculate the distance from the ball to the point
    let d = dist(ballBody.position.x, ballBody.position.y, point.current.x, point.current.y);
    if (d < ball.radius + point.length) {
      let moveDir = createVector(point.current.x - ballBody.position.x, point.current.y - ballBody.position.y);
      moveDir.setMag(2); // Offset force
      point.current.add(moveDir);
    } else {
      point.current.x = lerp(point.current.x, point.base.x, 0.1);
      point.current.y = lerp(point.current.y, point.base.y, 0.1);
    }

    // Update angles based on time part or noise
    if (point.isTimePart) {
      if (followBall) {
        point.angle = atan2(dir.y, dir.x);
      } else {
        let noiseX = noise(waveSeedX + point.base.x * 0.01, waveOffset * 0.01);
        let noiseY = noise(waveSeedY + point.base.y * 0.01, waveOffset * 0.01);
        point.angle = map(noiseX + noiseY, 0, 2, -PI, PI);
      }
      stroke(169);
    } else {
      let noiseX = noise(waveSeedX + point.base.x * 0.01, waveOffset * 0.01);
      let noiseY = noise(waveSeedY + point.base.y * 0.01, waveOffset * 0.01);
      point.angle = map(noiseX + noiseY, 0, 2, -PI, PI);
      stroke(abs(cos(point.angle)) > 0.99 || abs(sin(point.angle)) > 0.99 ? 255 : 169);
    }

    strokeWeight(point.strokeWeight);
    let endX = point.current.x + cos(point.angle) * point.length;
    let endY = point.current.y + sin(point.angle) * point.length;
    line(point.current.x, point.current.y, endX, endY);
  });

  // Draw the blue ball
  fill(100, 150, 255, 50); // Set ball color to blue
  noStroke();
  ellipse(ballBody.position.x, ballBody.position.y, ball.radius * 2);

  ball.pos.set(ballBody.position.x, ballBody.position.y);
  waveOffset += 1;
}

function touchStarted() {
  followBall = !followBall;
  return false;
}

function mousePressed() {
  followBall = !followBall;
}

function keyPressed() {
  let force = 0.05;
  if (keyCode === UP_ARROW) {
    Matter.Body.applyForce(ballBody, ballBody.position, { x: 0, y: -force });
  } else if (keyCode === DOWN_ARROW) {
    Matter.Body.applyForce(ballBody, ballBody.position, { x: 0, y: force });
  } else if (keyCode === LEFT_ARROW) {
    Matter.Body.applyForce(ballBody, ballBody.position, { x: -force, y: 0 });
  } else if (keyCode === RIGHT_ARROW) {
    Matter.Body.applyForce(ballBody, ballBody.position, { x: force, y: 0 });
  }
}
