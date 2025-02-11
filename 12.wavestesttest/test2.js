let Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies;

let engine, world;
let ballBody;
let ball;
let fontGraphics;
let waveOffset = 0;
let waveSeedX, waveSeedY;
let followBall = false;
let gravity;

function setup() {
  createCanvas(600, 600);
  engine = Engine.create();
  world = engine.world;
  engine.gravity.y = 0;  // 设置重力

  waveSeedX = random(1000);
  waveSeedY = random(1000);

  // 创建小球
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

  // 添加设备方向事件监听器
  window.addEventListener("deviceorientation", function(event) {
    let beta = event.beta;   // 设备绕X轴旋转（前后）
    let gamma = event.gamma; // 设备绕Y轴旋转（左右）
    
    // 根据设备旋转调整重力方向
    engine.gravity.x = (gamma / 90); // 将gamma映射到-1到1之间
    engine.gravity.y = (beta / 90);  // 将beta映射到-1到1之间
  });
}

function draw() {
  background(0);
  Engine.update(engine, 1000 / 30); // 确保更新频率

  // 根据设备的旋转设置重力方向
  let rotationForceX = (rotationY / 2);  // X轴上的旋转影响
  let rotationForceY = (rotationX / 2);  // Y轴上的旋转影响
  
  // 直接影响重力
  engine.gravity.x = rotationForceX * 0.5;
  engine.gravity.y = rotationForceY * 0.5;

  // 根据设备旋转来影响小球的位置
  let gravityForce = createVector(engine.gravity.x, engine.gravity.y);
  Matter.Body.applyForce(ballBody, ballBody.position, {
    x: gravityForce.x * 0.1,
    y: gravityForce.y * 0.1
  });

  // 更新小球的坐标
  ball.pos.set(ballBody.position.x, ballBody.position.y);

  // 限制小球在画布内
  Matter.Body.setPosition(ballBody, {
    x: constrain(ballBody.position.x, ball.radius, width - ball.radius),
    y: constrain(ballBody.position.y, ball.radius, height - ball.radius),
  });

  fill(100, 150, 255, 50);  // 蓝色小球
  noStroke();
  ellipse(ballBody.position.x, ballBody.position.y, ball.radius * 2);

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
