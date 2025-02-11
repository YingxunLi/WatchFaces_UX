// 引入Matter.js物理引擎
const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Body = Matter.Body;

let engine;
let particles = [];
let whiteParticles = [];
let targetPoints = [];
let colonPoints = [];
let magnetsActive = false;
let boundaries = [];

let textGraphic;


function setup() {
    createCanvas(960, 960); // 创建画布 960x960
    engine = Engine.create();
    let world = engine.world;
    engine.world.gravity.y = 0;

    
    textGraphic = createGraphics(width, height);
    textGraphic.pixelDensity(1);


    textAlign(CENTER, CENTER); // 设置文字对齐方式

    // 创建边界，防止粒子飞出画布
    boundaries.push(new Boundary(width / 2, height + 100, width + 200, 200)); // 上边界
    boundaries.push(new Boundary(-100, height / 2, 200, height + 200)); // 左边界
    boundaries.push(new Boundary(width + 100, height / 2, 200, height + 200)); // 右边界
    boundaries.push(new Boundary(width / 2, -100, width + 200, 200)); // 下边界

    // 获取当前时间，生成对应的目标点
    let currentTime = nf(hour(), 2) + ':' + nf(minute(), 2);
    targetPoints = getTextPoints(currentTime, width / 2, height / 2, 350);
    colonPoints = targetPoints.filter(pt => pt.x > width / 2 - 50 && pt.x < width / 2 + 50);

    // 创建粒子
    let maxParticles = 600;
    for (let i = 0; i < Math.min(targetPoints.length, maxParticles); i++) {
        let pt = targetPoints[i];
        let randomX = random(width);
        let randomY = random(height);
        let body = Bodies.circle(randomX, randomY, 6, {
            restitution: 0.15,
            friction: 0.1,
            frictionAir: 0.01
        });
        particles.push(body);
        // World.add(world, body);
        World.add(engine.world, body);
        console.log("粒子添加到世界: ", body);
        
    }
}

function draw() {
    background(0);  // 设置背景为黑色

    Engine.update(engine);  // 更新物理引擎
    adjustWhiteParticles(second());  // 调整白色粒子的数量


    fill(0, 255, 255);  // 青色
    noStroke();
    ellipse(300, 300, 300, 50);  // 绘制一个圆形测试青色是否显示


    // 处理粒子位置
    for (let i = 0; i < particles.length; i++) {
        let body = particles[i];
        if (magnetsActive) {
            let target = targetPoints[i];
            let force = createVector(target.x - body.position.x, target.y - body.position.y);
            force.mult(0.000005);
            Body.applyForce(body, body.position, force);
        } else {
            let mouseForce = createVector(mouseX - body.position.x, mouseY - body.position.y);
            mouseForce.setMag(0.0001);
            Body.applyForce(body, body.position, mouseForce);
        }
    }

    // 绘制时间数字的粒子（青色）
    fill(0, 255, 255);  
    noStroke();
    for (let body of particles) {
        let pos = body.position;
        ellipse(pos.x, pos.y, 50);
    }

    // 处理白色粒子
    for (let body of whiteParticles) {
        let mouseForce = createVector(mouseX - body.position.x, mouseY - body.position.y);
        mouseForce.setMag(0.0001);
        Body.applyForce(body, body.position, mouseForce);
    }

    // 绘制白色粒子
    fill(250, 250, 250);  
    noStroke();
    for (let body of whiteParticles) {
        let pos = body.position;
        ellipse(pos.x, pos.y, 20);
    }

    // 绘制目标点（红色）
    fill(255, 0, 0, 0);
    noStroke();
    for (let pt of targetPoints) {
        ellipse(pt.x, pt.y, 10);
    }

    // 绘制边界
    for (let boundary of boundaries) {
        boundary.show();
    }
}

// 根据秒数调整白色粒子数量
function adjustWhiteParticles(seconds) {
    while (whiteParticles.length < seconds) {
        let randomPoint;
        if (magnetsActive && colonPoints.length > 0) {
            randomPoint = random(colonPoints);
        } else {
            randomPoint = createVector(random(width), random(height));
        }
        
        if (randomPoint) {
            let body = Bodies.circle(randomPoint.x, randomPoint.y, 6, {
                restitution: 0.8,
                friction: 0.1,
                frictionAir: 0.01
            });
            whiteParticles.push(body);
            World.add(engine.world, body);
        }
    }

    while (whiteParticles.length > seconds) {
        let body = whiteParticles.pop();
        World.remove(engine.world, body);
    }
}


// 处理鼠标点击事件，切换磁力状态并触发爆炸
function mousePressed() {
    magnetsActive = !magnetsActive;
    explode(mouseX, mouseY, 200, 0.05);
}

// 爆炸效果
function explode(x, y, radius, forceMagnitude) {
    for (let body of particles.concat(whiteParticles)) {
        let pos = body.position;
        let distance = dist(x, y, pos.x, pos.y);
        if (distance < radius) {
            let force = createVector(pos.x - x, pos.y - y);
            force.setMag(forceMagnitude * (1 - distance / radius));
            Body.applyForce(body, body.position, { x: force.x, y: force.y });
        }
    }
}

// 获取文本的坐标点

function getTextPoints(txt, x, y, fontSize) {
    let points = [];

    textGraphic.clear();

    // let textGraphic = createGraphics(width, height);
    // textGraphic.pixelDensity(1);  // 确保像素密度正确
    textGraphic.background(0);  // 设置背景色，避免透明
    textGraphic.textFont('sans-serif');
    textGraphic.textSize(fontSize);
    textGraphic.fill(255);
    textGraphic.textAlign(CENTER, CENTER);
    textGraphic.text(txt, x, y);

    textGraphic.loadPixels();  // 读取像素数据

    if (textGraphic.pixels.length === 0) {
        console.error("textGraphic.pixels 为空，无法获取文本点数据！");
        return [];
    }

    for (let i = 0; i < textGraphic.width; i += 12) {
        for (let j = 0; j < textGraphic.height; j += 12) {
            let idx = 4 * (i + j * textGraphic.width);
            if (textGraphic.pixels[idx] > 128) {  // 检测亮度
                points.push({ x: i, y: j });
            }
        }
    }

    console.log("生成的目标点: ", points);
    return points;
}



// 边界类
class Boundary {
    constructor(x, y, w, h) {
        this.body = Bodies.rectangle(x, y, w, h, {
            isStatic: true,
            restitution: 1.0
        });
        this.w = w;
        this.h = h;
        World.add(engine.world, this.body);
    }

    show() {
        let pos = this.body.position;
        fill(200);
        noStroke();
        rectMode(CENTER);
        rect(pos.x, pos.y, this.w, this.h);
    }
}
