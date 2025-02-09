let points = [];
let gravity;
let ball;
let fontSize = 300 * 1.6;  // 调整字体大小
let fontGraphics;
let waveOffset = 0;
let waveSeedX, waveSeedY;
let followBall = false;
let changeLineColor = false;
let ballVelocity;

function setup() {
  createCanvas(960, 960);  // 更改画布大小
  gravity = createVector(width / 2, height / 2);

  waveSeedX = random(1000);
  waveSeedY = random(1000);

  let spacing = 15 * 1.6;  // 调整点之间的间距

  for (let x = spacing; x < width; x += spacing) {
    for (let y = spacing; y < height; y += spacing) {
      points.push({
        base: createVector(x, y), // 原始位置
        current: createVector(x, y), // 当前位置
        angle: random(TWO_PI),
        length: 10 * 1.6,  // 调整长度
        isTimePart: false,
        blueIntensity: 0, // 色彩强度
        strokeWeight: 2 * 1.6, // 调整线条宽度
      });
    }
  }

  ball = {
    pos: createVector(width / 2, height / 2),
    radius: 15 * 1.6,  // 调整球的半径
  };

  ballVelocity = createVector(0, 0);

  fontGraphics = createGraphics(width, height);
  fontGraphics.pixelDensity(1);
}

function draw() {
  background(0);
  strokeWeight(2 * 1.6);  // 调整线条宽度

  gravity.set(ball.pos.x, ball.pos.y);

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
    let dir = gravity.copy();
    dir.sub(point.base);

    let px = floor(point.base.x);
    let py = floor(point.base.y);
    if (px >= 0 && px < width && py >= 0 && py < height) {
      let index = (py * width + px) * 4;
      point.isTimePart = fontGraphics.pixels[index] > 128;
    } else {
      point.isTimePart = false;
    }

    if (point.blueIntensity > 0) {
      let mouseDir = createVector(point.current.x - mouseX, point.current.y - mouseY);
      let distance = mouseDir.mag();
      if (distance < 50) {
        mouseDir.setMag(5 - distance / 10);
        point.current.add(mouseDir);
      }

      let greenPart = map(point.blueIntensity, 255, 0, 79, 79);
      let bluePart = map(point.blueIntensity, 255, 0, 77, 77);
      stroke(0, greenPart, bluePart);

      point.blueIntensity = max(0, point.blueIntensity - 10);
      point.strokeWeight = map(point.blueIntensity, 255, 0, 4, 2);
    } else {
      point.current.x = lerp(point.current.x, point.base.x, 0.1);
      point.current.y = lerp(point.current.y, point.base.y, 0.1);
      point.strokeWeight = 2;

      if (point.isTimePart) {
        if (followBall) {
          point.angle = atan2(dir.y, dir.x);
        } else {
          let noiseX = noise(waveSeedX + point.base.x * 0.01, waveOffset * 0.01);
          let noiseY = noise(waveSeedY + point.base.y * 0.01, waveOffset * 0.01);
          let waveAngle = map(noiseX + noiseY, 0, 2, -PI, PI);
          point.angle = waveAngle;
        }

        let angle = point.angle;
        if (changeLineColor) {
          stroke(169);
        } else if (abs(cos(angle)) > 0.99 || abs(sin(angle)) > 0.99) {
          stroke(255);
        } else {
          stroke(169);
        }
      } else {
        let noiseX = noise(waveSeedX + point.base.x * 0.01, waveOffset * 0.01);
        let noiseY = noise(waveSeedY + point.base.y * 0.01, waveOffset * 0.01);
        let waveAngle = map(noiseX + noiseY, 0, 2, -PI, PI);
        point.angle = waveAngle;

        let angle = point.angle;
        if (abs(cos(angle)) > 0.99 || abs(sin(angle)) > 0.99) {
          stroke(255);
        } else {
          stroke(169);
        }
      }
    }

    strokeWeight(point.strokeWeight);

    let endX = point.current.x + cos(point.angle) * point.length;
    let endY = point.current.y + sin(point.angle) * point.length;

    line(point.current.x, point.current.y, endX, endY);
  });

  ball.pos.add(ballVelocity);

  if (ball.pos.x - ball.radius < 0 || ball.pos.x + ball.radius > width) {
    ballVelocity.x = 0;
    ball.pos.x = constrain(ball.pos.x, ball.radius, width - ball.radius);
  }
  if (ball.pos.y - ball.radius < 0 || ball.pos.y + ball.radius > height) {
    ballVelocity.y = 0;
    ball.pos.y = constrain(ball.pos.y, ball.radius, height - ball.radius);
  }

  if (mouseIsPressed) {
    points.forEach((point) => {
      let d = dist(mouseX, mouseY, point.base.x, point.base.y);
      if (d < 100) {
        point.blueIntensity = 255;
      }
    });
  }

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
  let speed = 10 * 1.6;  // 调整球的移动速度
  if (keyCode === UP_ARROW) {
    ballVelocity.set(0, -speed);
  } else if (keyCode === DOWN_ARROW) {
    ballVelocity.set(0, speed);
  } else if (keyCode === LEFT_ARROW) {
    ballVelocity.set(-speed, 0);
  } else if (keyCode === RIGHT_ARROW) {
    ballVelocity.set(speed, 0);
  }
}
