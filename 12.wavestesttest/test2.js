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
  engine.gravity.scale = 0.001;

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
    restitution: 0.5,
    friction: 0.1,
    frictionAir: 0.01,
  });
  World.add(world, ballBody);

  fontGraphics = createGraphics(width, height);
  fontGraphics.pixelDensity(1);
}

function draw() {
  background(0);
  // Engine.update(engine);
  Engine.update(engine, 1000 / 30); // 确保 iOS 不降低刷新率
  // 限制球体在画布范围内
  Matter.Body.setPosition(ballBody, {
    x: constrain(ballBody.position.x, ball.radius, width - ball.radius),
    y: constrain(ballBody.position.y, ball.radius, height - ball.radius),
});

window.addEventListener("deviceorientation", function(event) {
  let beta = event.beta; // X轴倾斜（前后）
  let gamma = event.gamma; // Y轴倾斜（左右）
  
  engine.gravity.x = (gamma / 90) * 0.2; // 让重力在 -0.2 ~ 0.2 之间
  engine.gravity.y = (beta / 90) * 0.2;
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

    // 计算球与线条的距离
    let d = dist(ballBody.position.x, ballBody.position.y, point.current.x, point.current.y);
    if (d < ball.radius + point.length) {
      // 让靠近球的线条受到影响，向远离球的方向偏移
      let moveDir = createVector(point.current.x - ballBody.position.x, point.current.y - ballBody.position.y);
      moveDir.setMag(2); // 偏移力度
      point.current.add(moveDir);
    } else {
      // 逐渐恢复到原始位置
      point.current.x = lerp(point.current.x, point.base.x, 0.1);
      point.current.y = lerp(point.current.y, point.base.y, 0.1);
    }

    

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

  // 绘制小球
  fill(100, 150, 255); // 设定小球颜色为蓝色
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