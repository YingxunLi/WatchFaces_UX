const { Engine, Runner, Bodies, Composite, Constraint, Mouse, MouseConstraint, Events } = Matter;

const canvasWidth = 960;
const canvasHeight = 960;

let engine, world, pendulum, constraint, mouseConstraint;
const baseBallRadius = 100;
let leftBorder, rightBorder;
const borderThickness = 100;
let timeMultiplier = 1;
let simulatedTime = Date.now();
let pendulumGrabbed = false;
let isTouching = false;

let borderColorLeft = '#404040';
let borderColorRight = '#404040';

let showLeftRectangles = false;
let showRightRectangles = false;
let leftTimer = 0;
let rightTimer = 0;
const rectangleVisibleTime = 1500;

function setup() {
    const canvas = createCanvas(canvasWidth, canvasHeight);

    // 创建 Matter.js 引擎和世界
    engine = Engine.create();
    world = engine.world;

    // 创建摆锤
    pendulum = Bodies.circle(canvasWidth / 2, canvasHeight / 2 + 400, baseBallRadius, {
        restitution: 1,
        density: 3.0,
        frictionAir: 0.00,
        render: { fillStyle: 'transparent' },
    });

    // 创建约束（摆锤的悬挂点）
    let anchor = { x: canvasWidth / 2, y: 0 };
    constraint = Constraint.create({
        pointA: anchor,
        bodyB: pendulum,
        length: canvasHeight / 1.5,
        stiffness: 1,
        render: { strokeStyle: 'white', lineWidth: 3 },
    });

    // 将摆锤和约束添加到世界中
    Composite.add(world, [pendulum, constraint]);

    // 创建鼠标约束
    let mouse = Mouse.create(canvas.elt);
    mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: { stiffness: 0.2, render: { visible: false } },
    });
    Composite.add(world, mouseConstraint);

    // 运行引擎
    Engine.run(engine);

    // 监听鼠标拖拽事件
    Events.on(mouseConstraint, 'startdrag', function (event) {
        if (event.body === pendulum) {
            pendulumGrabbed = true;
        }
    });

    Events.on(mouseConstraint, 'enddrag', function (event) {
        if (event.body === pendulum) {
            pendulumGrabbed = false;
        }
    });

    // 绑定触摸事件
    canvas.elt.addEventListener('touchstart', (event) => {
        event.preventDefault(); // 阻止默认行为
        let touch = event.touches[0];
        let touchX = touch.clientX;
        let touchY = touch.clientY;
        let d = dist(touchX, touchY, pendulum.position.x, pendulum.position.y);
        if (d < baseBallRadius) {
            isTouching = true;
            pendulumGrabbed = true;
        }
    });

    canvas.elt.addEventListener('touchmove', (event) => {
        if (isTouching) {
            event.preventDefault(); // 阻止默认行为
            let touch = event.touches[0];
            Matter.Body.setPosition(pendulum, { x: touch.clientX, y: touch.clientY });
        }
    });

    canvas.elt.addEventListener('touchend', () => {
        isTouching = false;
        pendulumGrabbed = false;
    });
}

function draw() {
    background(15);

    simulatedTime += deltaTime * timeMultiplier;
    let simulatedDate = new Date(simulatedTime);
    let hours = simulatedDate.getHours() % 12;
    let minutes = simulatedDate.getMinutes();
    let seconds = simulatedDate.getSeconds();

    // 计时器
    const visibilityDuration = 1000;
    if (showLeftRectangles && millis() - leftTimer > visibilityDuration) {
        showLeftRectangles = false;
    }
    if (showRightRectangles && millis() - rightTimer > visibilityDuration) {
        showRightRectangles = false;
    }

    // 绘制边框
    noFill();
    stroke(borderColorLeft);
    strokeWeight(3);
    rect(leftBorder.position.x - borderThickness / 2, leftBorder.position.y - canvasHeight / 2, borderThickness, canvasHeight);
    stroke(borderColorRight);
    rect(rightBorder.position.x - borderThickness / 2, rightBorder.position.y - canvasHeight / 2, borderThickness, canvasHeight);

    // 绘制时间刻度
    if (showLeftRectangles || showRightRectangles) {
        let leftRectHeight = canvasHeight / 12;
        let smallRectSpacing = 5;
        let smallRectHeight = (leftRectHeight - smallRectSpacing * 5) / 6;
        let filledSmallRectangles = Math.floor(minutes / 10);
        let minuteProgress = (minutes % 10) / 10;

        for (let i = 0; i < 12; i++) {
            let yPosition = leftBorder.position.y + canvasHeight / 2 - (i + 1) * leftRectHeight;
            let isFilled = i < hours;

            fill(isFilled ? '#FAE552' : '#404040');
            rect(leftBorder.position.x - borderThickness / 2, yPosition, borderThickness, leftRectHeight - 5);
            rect(rightBorder.position.x - borderThickness / 2, yPosition, borderThickness, leftRectHeight - 5);

            if (i === hours) {
                for (let j = 0; j < 6; j++) {
                    let smallRectY = yPosition + (5 - j) * (smallRectHeight + smallRectSpacing);
                    if (j < filledSmallRectangles) {
                        fill('#FAE552');
                    } else if (j === filledSmallRectangles) {
                        fill('#FAE552');
                        rect(leftBorder.position.x - borderThickness / 2, smallRectY, borderThickness * minuteProgress, smallRectHeight);
                        rect(rightBorder.position.x + borderThickness / 2 - borderThickness * minuteProgress, smallRectY, borderThickness * minuteProgress, smallRectHeight);
                        continue;
                    } else {
                        fill('#404040');
                    }
                    rect(leftBorder.position.x - borderThickness / 2, smallRectY, borderThickness, smallRectHeight);
                    rect(rightBorder.position.x - borderThickness / 2, smallRectY, borderThickness, smallRectHeight);
                }
            }
        }
    }

    // 绘制摆锤
    if (pendulumGrabbed) {
        fill('#FFFFFF');
    } else {
        noFill();
    }
    stroke('#FFFFFF');
    strokeWeight(3);
    ellipse(pendulum.position.x, pendulum.position.y, baseBallRadius * 2);

    // 绘制约束线
    stroke('white');
    strokeWeight(3);
    line(constraint.pointA.x, constraint.pointA.y, pendulum.position.x, pendulum.position.y);
}

// 键盘事件
function keyPressed() {
    if (key === 's' || key === 'S') {
        timeMultiplier = 400;
    } else if (key === 'e' || key === 'E') {
        timeMultiplier = 1;
        simulatedTime = Date.now();
    }
}