const { Engine, Runner, Bodies, Composite, Constraint, Events } = Matter;

const canvasWidth = 960;
const canvasHeight = 960;

let engine, world, pendulum, constraint;
let dragging = false;
let touchConstraint = null;

const baseBallRadius = 100;
let simulatedTime = Date.now(); // Simulierte Zeit für die Stundenanzeige

// Border-Konfiguration
const borderThickness = 100;
let leftBorder, rightBorder;
let showLeftRectangles = false;
let showRightRectangles = false;
let leftTimer = 0;
let rightTimer = 0;
const visibilityDuration = 1500;

function setup() {
    const canvas = createCanvas(canvasWidth, canvasHeight);
    engine = Engine.create();
    world = engine.world;

    // Pendel erstellen
    let pendulumX = canvasWidth / 2;
    let pendulumY = canvasHeight / 2 + 400;
    pendulum = Bodies.circle(pendulumX, pendulumY, baseBallRadius, {
        restitution: 1,
        density: 3.0,
        frictionAir: 0.01, 
        render: { fillStyle: 'white' },
    });

    let anchor = { x: canvasWidth / 2, y: 0 };

    // Seil (Constraint) für das Pendel
    constraint = Constraint.create({
        pointA: anchor,
        bodyB: pendulum,
        length: canvasHeight / 1.5,
        stiffness: 1,
        render: { strokeStyle: 'white', lineWidth: 3 },
    });

    Composite.add(world, [pendulum, constraint]);

    // **Border links & rechts**
    leftBorder = Bodies.rectangle(borderThickness / 2, canvasHeight / 2, borderThickness, canvasHeight, { isStatic: true });
    rightBorder = Bodies.rectangle(canvasWidth - borderThickness / 2, canvasHeight / 2, borderThickness, canvasHeight, { isStatic: true });

    Composite.add(world, [leftBorder, rightBorder]);

    Engine.run(engine);

    // **Kollisionserkennung für das Pendel**
    Events.on(engine, "collisionStart", function(event) {
        let pairs = event.pairs;
        pairs.forEach(function(pair) {
            if ((pair.bodyA === pendulum && pair.bodyB === leftBorder) || (pair.bodyB === pendulum && pair.bodyA === leftBorder)) {
                showLeftRectangles = true;
                leftTimer = millis();
            }

            if ((pair.bodyA === pendulum && pair.bodyB === rightBorder) || (pair.bodyB === pendulum && pair.bodyA === rightBorder)) {
                showRightRectangles = true;
                rightTimer = millis();
            }
        });
    });
}

function draw() {
    background(15);
    Engine.update(engine);

    // **Timer für das Verschwinden der Stundenanzeige**
    if (showLeftRectangles && millis() - leftTimer > visibilityDuration) showLeftRectangles = false;
    if (showRightRectangles && millis() - rightTimer > visibilityDuration) showRightRectangles = false;

    // **Borders links & rechts zeichnen**
    noFill();
    stroke(100);
    strokeWeight(3);
    rect(leftBorder.position.x - borderThickness / 2, leftBorder.position.y - canvasHeight / 2, borderThickness, canvasHeight);
    rect(rightBorder.position.x - borderThickness / 2, rightBorder.position.y - canvasHeight / 2, borderThickness, canvasHeight);

    // **Nur anzeigen, wenn das Pendel die Border berührt**
    if (showLeftRectangles || showRightRectangles) {
        let simulatedDate = new Date(simulatedTime);
        let hours = simulatedDate.getHours() % 12 || 12;
        let blockHeight = canvasHeight / 12;

        for (let i = 0; i < 12; i++) {
            let yPosition = leftBorder.position.y + canvasHeight / 2 - (i + 1) * blockHeight;
            let isFilled = i < hours;

            fill(isFilled ? '#FAE552' : '#404040');
            rect(leftBorder.position.x - borderThickness / 2, yPosition, borderThickness, blockHeight - 5);
            rect(rightBorder.position.x - borderThickness / 2, yPosition, borderThickness, blockHeight - 5);
        }
    }

    // **Seil zeichnen**
    stroke('white');
    strokeWeight(3);
    line(constraint.pointA.x, constraint.pointA.y, pendulum.position.x, pendulum.position.y);

    // **Pendel-Farbwechsel: Schwarz, wenn nicht berührt – Weiß, wenn berührt**
    fill(dragging ? 255 : 0);
    ellipse(pendulum.position.x, pendulum.position.y, baseBallRadius * 2);
}

// 🔴 **TOUCHSTEUERUNG**
function touchStarted() {
    let touchX = touches[0].x;
    let touchY = touches[0].y;
    let distance = dist(touchX, touchY, pendulum.position.x, pendulum.position.y);

    if (distance < baseBallRadius) {
        dragging = true;
        touchConstraint = Constraint.create({
            pointA: { x: touchX, y: touchY },
            bodyB: pendulum,
            stiffness: 0.1,
            damping: 0.1
        });

        Composite.add(world, touchConstraint);
    }
}

function touchMoved() {
    if (dragging && touchConstraint) {
        let touchX = touches[0].x;
        let touchY = touches[0].y;
        touchConstraint.pointA = { x: touchX, y: touchY };
    }
}

function touchEnded() {
    dragging = false;
    if (touchConstraint) {
        Composite.remove(world, touchConstraint);
        touchConstraint = null;
    }
}

// 🏃‍♂️ **Tastensteuerung zum Ändern der Zeit**
function keyPressed() {
    if (key === 's' || key === 'S') simulatedTime += 3600000;
    if (key === 'r' || key === 'R') simulatedTime = Date.now();
}