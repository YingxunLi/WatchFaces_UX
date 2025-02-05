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

function setup() {
    createCanvas(960, 960); // Canvas bleibt 960x960
    engine = Engine.create();
    let world = engine.world;
    world.gravity.y = 0;

    textFont('Arial');
    textSize(600);
    textAlign(CENTER, CENTER);

    // Boundary-Objekte mit größerer Breite/Höhe, aber außerhalb des sichtbaren Canvas positioniert
    boundaries.push(new Boundary(width / 2, height + 100, width + 200, 200)); // Oben
    boundaries.push(new Boundary(-100, height / 2, 200, height + 200)); // Links
    boundaries.push(new Boundary(width + 100, height / 2, 200, height + 200)); // Rechts
    boundaries.push(new Boundary(width / 2, -100, width + 200, 200)); // Unten

    let currentTime = nf(hour(), 2) + ':' + nf(minute(), 2);
    targetPoints = getTextPoints(currentTime, width / 2, height / 2, 350);
    colonPoints = targetPoints.filter(pt => pt.x > width / 2 - 50 && pt.x < width / 2 + 50);

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
        World.add(world, body);
    }
}

function draw() {
    background(0);
    Engine.update(engine);
    adjustWhiteParticles(second());

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

    fill(0, 255, 255);
    noStroke();
    for (let body of particles) {
        let pos = body.position;
        ellipse(pos.x, pos.y, 50);
    }

    // Weiße Partikel beeinflussen
    for (let body of whiteParticles) {
        let mouseForce = createVector(mouseX - body.position.x, mouseY - body.position.y);
        mouseForce.setMag(0.0001);
        Body.applyForce(body, body.position, mouseForce);
    }

    fill(250, 250, 250);
    noStroke();
    for (let body of whiteParticles) {
        let pos = body.position;
        ellipse(pos.x, pos.y, 20);
    }

    fill(255, 0, 0, 0);
    noStroke();
    for (let pt of targetPoints) {
        ellipse(pt.x, pt.y, 10);
    }

    for (let boundary of boundaries) {
        boundary.show();
    }
}

// Passe die Anzahl der weißen Partikel an die Sekunden an
function adjustWhiteParticles(seconds) {
    while (whiteParticles.length < seconds) {
        if (magnetsActive) {
            // Weiße Partikel an den Magnetpunkten des Doppelpunkts erzeugen
            let randomColonPoint = random(colonPoints);
            let body = Bodies.circle(randomColonPoint.x, randomColonPoint.y, 6, {
                restitution: 0.8,
                friction: 0.1,
                frictionAir: 0.01
            });
            whiteParticles.push(body);
            World.add(engine.world, body);
        } else {
            // Weiße Partikel zufällig erzeugen
            let randomX = random(width);
            let randomY = random(height);
            let body = Bodies.circle(randomX, randomY, 6, {
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

function mousePressed() {
    magnetsActive = !magnetsActive;
    explode(mouseX, mouseY, 200, 0.05);
}

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

function getTextPoints(txt, x, y, fontSize) {
    let points = [];
    let textGraphic = createGraphics(width, height);
    textGraphic.textFont('Arial');
    textGraphic.textSize(fontSize);
    textGraphic.fill(255);
    textGraphic.textAlign(CENTER, CENTER);
    textGraphic.text(txt, x, y);

    textGraphic.loadPixels();
    for (let i = 0; i < textGraphic.width; i += 12) {
        for (let j = 0; j < textGraphic.height; j += 12) {
            let idx = 4 * (i + j * textGraphic.width);
            if (textGraphic.pixels[idx] > 128) {
                points.push({ x: i, y: j });
            }
        }
    }
    return points;
}

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
