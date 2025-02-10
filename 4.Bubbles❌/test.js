const { Engine, World, Bodies, Body } = Matter;

let engine, particles = [], whiteParticles = [], targetPoints = [], colonPoints = [], boundaries = [], magnetsActive = false;

function setup() {
    createCanvas(960, 960);
    engine = Engine.create();
    engine.world.gravity.y = 0;
    textAlign(CENTER, CENTER);

    boundaries = [
        new Boundary(width / 2, height + 100, width + 200, 200),
        new Boundary(-100, height / 2, 200, height + 200),
        new Boundary(width + 100, height / 2, 200, height + 200),
        new Boundary(width / 2, -100, width + 200, 200)
    ];

    let currentTime = nf(hour(), 2) + ':' + nf(minute(), 2);
    targetPoints = getTextPoints(currentTime, width / 2, height / 2, 350);
    colonPoints = targetPoints.filter(pt => pt.x > width / 2 - 50 && pt.x < width / 2 + 50);

    for (let i = 0; i < Math.min(targetPoints.length, 600); i++) {
        let body = Bodies.circle(random(width), random(height), 6, {
            restitution: 0.15, friction: 0.1, frictionAir: 0.01
        });
        particles.push(body);
        World.add(engine.world, body);
    }
}

function draw() {
    background(0);
    engine.gravity.x = (rotationY / 2 - engine.gravity.x) * 0.5;
    engine.gravity.y = (rotationX / 2 - engine.gravity.y) * 0.5;
    Engine.update(engine);
    adjustWhiteParticles(second());

    particles.forEach((body, i) => {
        let force = magnetsActive 
            ? createVector(targetPoints[i].x - body.position.x, targetPoints[i].y - body.position.y).mult(0.000005)
            : createVector(mouseX - body.position.x, mouseY - body.position.y).setMag(0.0001);
        Body.applyForce(body, body.position, force);
    });

    fill(0, 255, 255);
    noStroke();
    particles.forEach(body => ellipse(body.position.x, body.position.y, 50));

    whiteParticles.forEach(body => {
        let force = createVector(mouseX - body.position.x, mouseY - body.position.y).setMag(0.0001);
        Body.applyForce(body, body.position, force);
    });

    fill(250);
    whiteParticles.forEach(body => ellipse(body.position.x, body.position.y, 20));
    
    fill(255, 0, 0, 0);
    targetPoints.forEach(pt => ellipse(pt.x, pt.y, 10));
    
    boundaries.forEach(boundary => boundary.show());
}

function adjustWhiteParticles(seconds) {
    while (whiteParticles.length < seconds) {
        let pos = magnetsActive ? random(colonPoints) : { x: random(width), y: random(height) };
        let body = Bodies.circle(pos.x, pos.y, 6, { restitution: 0.8, friction: 0.1, frictionAir: 0.01 });
        whiteParticles.push(body);
        World.add(engine.world, body);
    }
    while (whiteParticles.length > seconds) {
        World.remove(engine.world, whiteParticles.pop());
    }
}

function mousePressed() {
    magnetsActive = !magnetsActive;
    explode(mouseX, mouseY, 200, 0.05);
}

function explode(x, y, radius, forceMagnitude) {
    [...particles, ...whiteParticles].forEach(body => {
        let distFactor = 1 - dist(x, y, body.position.x, body.position.y) / radius;
        if (distFactor > 0) {
            let force = createVector(body.position.x - x, body.position.y - y).setMag(forceMagnitude * distFactor);
            Body.applyForce(body, body.position, force);
        }
    });
}

function getTextPoints(txt, x, y, fontSize) {
    let points = [], textGraphic = createGraphics(width, height);
    textGraphic.textFont('sans-serif');
    textGraphic.textSize(fontSize);
    textGraphic.textAlign(CENTER, CENTER);
    textGraphic.text(txt, x, y);
    textGraphic.loadPixels();

    for (let i = 0; i < textGraphic.width; i += 12) {
        for (let j = 0; j < textGraphic.height; j += 12) {
            if (textGraphic.pixels[4 * (i + j * textGraphic.width)] > 128) {
                points.push({ x: i, y: j });
            }
        }
    }
    return points;
}

class Boundary {
    constructor(x, y, w, h) {
        this.body = Bodies.rectangle(x, y, w, h, { isStatic: true, restitution: 1.0 });
        this.w = w;
        this.h = h;
        World.add(engine.world, this.body);
    }
    show() {
        fill(200);
        noStroke();
        rectMode(CENTER);
        rect(this.body.position.x, this.body.position.y, this.w, this.h);
    }
}
