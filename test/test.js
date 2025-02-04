let Engine = Matter.Engine;
let World = Matter.World;
let Bodies = Matter.Bodies;
let Body = Matter.Body;
let engine;
let world;

let bubbles = []; // 存储所有气泡的数组

let images = []; // 用于存储预加载的数字图
let colonImage; // 存储冒号图像

let lastMouseX, lastMouseY;
let originalRadii = []; // 存储每个气泡的初始半径
let enlargeBubbles = []; // 存储被放大气泡的索引和缩放信息
let enlargedRadii = []; // 存储被放大气泡的绘制半径
let enlargeStartTime = null; // 记录放大开始的时间

let scaleFactor = 1; // 初始缩放比例

Matter.use('matter-wrap');

function preload() {
  // 预加载 0 到 9 的数字图片
  for (let i = 0; i < 10; i++) {
    images[i] = loadImage(`images3.1/${i}.svg`);
  }
  colonImage = loadImage('images3.1/punkt.svg');
}

function setup() {
  createCanvas(960, 960); // 创建600x600的画布

  engine = Engine.create(); // 创建物理引擎
  world = engine.world;







  // reset gravity to zero for start, gravity will be controlled by motion
  engine.gravity.y = 0;






  lastMouseX = mouseX; // 初始化鼠标位置变量
  lastMouseY = mouseY;

  // 创建800个气泡，初始物理半径为10，随机分布在画布中间部分
  for (let i = 0; i < 800; i++) {
    let bubble = Bodies.circle(random(width / 4, 3 * width / 4), random(height / 4, 3 * height / 4), 8, {
      restitution: 0.8, // 反弹系数，影响弹性
      friction: 0.1,    // 摩擦系数，影响滑动

      plugin: {
        wrap: {
          min: {
            x: 0,
            y: 0
          },
          max: {
            x: width,
            y: height
          }
        }
      }


    });

    World.add(world, bubble); // 将气泡添加到物理世界中
    bubbles.push(bubble);
    originalRadii.push(bubble.circleRadius); // 存储每个气泡的初始半径
    enlargedRadii.push(50); // 初始化默认绘制半径为100
  }

  // 设置画布边界，防止气泡移出画布
  let ground = Bodies.rectangle(width / 2, height + 100, width, 200, { isStatic: true });
  let leftWall = Bodies.rectangle(-100, height / 2, 200, height, { isStatic: true });
  let rightWall = Bodies.rectangle(width + 100, height / 2, 200, height, { isStatic: true });
  let ceiling = Bodies.rectangle(width / 2, -100, width, 200, { isStatic: true });

  World.add(world, [ground, leftWall, rightWall, ceiling]); // 将边界添加到物理世界中
}

function draw() {

  
  background('black'); // 清空背景，设置为黑色




  // apply rotation of device to gravity
  engine.gravity.x = (rotationY / 2 - engine.gravity.x) * 0.5;
  engine.gravity.y = (rotationX / 2 - engine.gravity.y) * 0.5;
  


  

  // 应用缩放比例
  translate(width / 2, height / 2); // 将画布中心移动到屏幕中心
  scale(scaleFactor); // 缩放画布
  translate(-width / 2, -height / 2); // 再移动回原点

  Engine.update(engine); // 更新物理引擎状态

  // 计算鼠标移动的差异以模拟摇动效果
  let dx = mouseX - lastMouseX;
  let dy = mouseY - lastMouseY;

  // 遍历每个气泡，施加力并绘制
  bubbles.forEach((bubble, index) => {
    Body.applyForce(bubble, bubble.position, { x: dx * 0.0001, y: dy * 0.0001 }); // 施加微小力以模拟移动

    fill(0, 255, 255, 150); // 设置气泡填充颜色和透明度
    noStroke(); // 无边框
    circle(bubble.position.x, bubble.position.y, enlargedRadii[index]); // 绘制半径可以变化的圆
  });

  // 检查放大时间是否超过5秒并恢复
  if (enlargeStartTime && millis() - enlargeStartTime > 5000) {
    enlargeBubbles.forEach(index => {
      enlargedRadii[index] = 50; // 恢复默认的绘制半径
    });
    enlargeBubbles = []; // 清空放大的气泡
    enlargeStartTime = null; // 重置放大计时
  }

  // 保存当前鼠标位置，用于下次比较
  lastMouseX = mouseX;
  lastMouseY = mouseY;

  // 绘制遮罩图像在气泡之上
  let h = nf(hour() % 24, 2); // 小时（24小时制）
  let m = nf(minute(), 2);    // 分钟（两位数）
  let timeStr = `${h}:${m}`; // 拼接时间字符串，包含冒号

  // 定义图像尺寸
  let imgWidth = 210;  // 单个数字的宽度
  let imgHeight = 960; // 高度与画布一致
  let colonWidth = 120; // 冒号的宽度

  // 计算总宽度（4个数字 + 1个冒号）
  let totalWidth = 4 * imgWidth + colonWidth;

  // 计算起始偏移量，使时间居中
  let xOffset = width / 2 - totalWidth / 2;

  // 遍历时间字符串，逐一绘制
  for (let i = 0; i < timeStr.length; i++) {
    let char = timeStr[i];

    // 判断是否是冒号
    if (char === ":") {
      // 绘制冒号图片
      image(loadImage("images/punkt.svg"), 480, 480, 120, 960);
      xOffset += colonWidth; // 偏移量增加冒号的宽度
    } else {
      // 绘制数字图片
      let imgIndex = int(char);
      image(images[imgIndex], xOffset, height / 2 - imgHeight / 2, imgWidth, imgHeight);
      xOffset += imgWidth; // 偏移量增加数字的宽度
    }
  }

  image(colonImage, 420, 0, 120, 960); // 绘制遮罩图像在气泡之上
}

function mousePressed() {
  if (!enlargeStartTime) { // 仅当没有正在放大时执行
    for (let i = 0; i < bubbles.length; i++) { // 假定选择50%的气泡进行放大
      let index = Math.floor(random(bubbles.length)); // 随机选择气泡的索引
      enlargeBubbles.push(index); // 存储被放大的气泡的索引
      enlargedRadii[index] = random(150, 400); // 变化显示半径大小
    }
    enlargeStartTime = millis(); // 记录开始放大的时间
  }
}

function keyPressed() {
  if (key === '+') {
    scaleFactor = constrain(scaleFactor + 0.1, 0.5, 2); // 最大放大2倍，最小缩小到0.5倍
  } else if (key === '-') {
    scaleFactor = constrain(scaleFactor - 0.1, 0.5, 2);
  }
}