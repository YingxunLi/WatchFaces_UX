let Engine = Matter.Engine;
let World = Matter.World;
let Bodies = Matter.Bodies;
let Runner = Matter.Runner;
let Constraint = Matter.Constraint;
// let Body = Matter.Body;

let engine;
let runner;
let world;

let magnets = [];
let balls = [];
let centralMagnet;
let chainBodies = [];


let secondsBallInitialized = false; // Kontrolliert, ob der Sekundenball initialisiert wurde

function setup() {
    let canvas = createCanvas(960, 960);
    centerCanvas(canvas);

    engine = Engine.create();
    runner = Runner.create({isFixed: true, delta: 1000/60});
    world = engine.world;
    engine.gravity.y = 0;

    let magnetCount = 60; // 60 outer magnets
    let radius = 350; // Radius of the outer circle
    magnets = [];

    // Create the outer magnets
    for (let i = 0; i < magnetCount; i++) {
        let angle = map(i, 0, magnetCount, -PI / 2, 3 * PI / 2);
        let x = width / 2 + radius * cos(angle);
        let y = height / 2 + radius * sin(angle);

        let magnet = { x, y, index: i };
        magnets.push(magnet);
    }

    // Create the central magnet
    centralMagnet = {
        x: width / 2,
        y: height / 2,
        size: 60 // Size of the central magnet
    };

    // Create the balls for hours, minutes, and seconds
    let sizes = [100, 80, 60]; // Sizes for hours, minutes, seconds
    for (let i = 0; i < 3; i++) {
        let x = width / 2;
        let y = height / 2;

        let ball = {
            x,
            y,
            body: Bodies.circle(x, y, sizes[i], {
                restitution: 0.5,
                density: 0.01
            }),
            size: sizes[i],
            toCentral: true, // Kontrolliert, ob der Ball zum zentralen Magneten zieht
            currentMagnet: null // Wird für den Sekundenball verwendet
        };
        World.add(world, ball.body);
        balls.push(ball);
    }
    // Create chain around the balls' perimeter
    createChainAroundBalls();
    Runner.run(runner, engine);
}
function createChainAroundBalls() {
    let radius = 200; // radius should encompass the balls' perimeter
    let chainLength = 12; // length between each body in the chain
    let chainStiffness = 0.01; // stiffness of the chain
    let numLinks = 30; // number of links in the chain

    for (let i = 0; i < numLinks; i++) {
        let angle = map(i, 0, numLinks, 0, TWO_PI); // evenly spaced around a circle
        let x = width / 2 + radius * cos(angle);
        let y = height / 2 + radius * sin(angle);

        let chainLink = Bodies.circle(x, y, 10, {
            restitution: 0.5,
            density: 0.01
        });
        World.add(world, chainLink);
        chainBodies.push(chainLink);

        // Apply constraints to connect the chain links
        if (i > 0) {
            let constraint = Constraint.create({
                bodyA: chainBodies[i - 1],
                bodyB: chainBodies[i],
                stiffness: chainStiffness,
                length: chainLength
            });
            World.add(world, constraint);
        }
    }

    // Connect the last link to the first one to form a closed loop
    let lastConstraint = Constraint.create({
        bodyA: chainBodies[chainBodies.length - 1],
        bodyB: chainBodies[0],
        stiffness: chainStiffness,
        length: chainLength
    });
    World.add(world, lastConstraint);

    chainBodies.forEach((chainLink) => {
        chainLink.render.fillStyle = 'white';
    });
}
function draw() {
    background(0);

    // Draw the central magnet
    fill('blue'); // Blue for the central magnet
    noStroke();
    ellipse(centralMagnet.x, centralMagnet.y, centralMagnet.size);

    // Update balls' positions
    updateBalls();

    // Draw balls
    balls.forEach((ball) => {
        fill('white');
        ellipse(ball.x, ball.y, ball.size);
        fill('red');
        ellipse(ball.body.position.x, ball.body.position.y, ball.size);
    });

    // Draw outer magnets
    magnets.forEach((magnet, index) => {
        fill('grey'); // Alle Magnete bleiben grau
        noStroke();
        ellipse(magnet.x, magnet.y, 10);
    });

        // Draw chain links
        chainBodies.forEach((chainLink) => {
            fill(chainLink.render.fillStyle);
            noStroke();
            ellipse(chainLink.position.x, chainLink.position.y, chainLink.circleRadius * 2);
        });
    
}

function updateBalls() {
    let currentHour = hour() % 12; // Convert to 12-hour format
    let currentMinute = minute();
    let currentSecond = second();

    balls.forEach((ball, index) => {
        if (ball.toCentral) {
            // Bewegung zum zentralen Magneten
            let dx = centralMagnet.x - ball.x;
            let dy = centralMagnet.y - ball.y;
            let distance = sqrt(dx * dx + dy * dy);

            if (distance < 5) {
                // Zentralen Magneten erreicht
                ball.toCentral = false;
                if (index === 2) {
                    ball.currentMagnet = currentSecond; // Sekundenball: Zielmagnet initialisieren
                }
            } else {
                // Bewegung zum zentralen Magneten
                let stepSize = 5;
                ball.x += (dx / distance) * stepSize;
                ball.y += (dy / distance) * stepSize;
            }
        } else {
            // Bewegung zu den äußeren Magneten
            let targetMagnet;

            if (index === 0) {
                targetMagnet = magnets[Math.floor(currentHour * 5)]; // Stundenball
            } else if (index === 1) {
                targetMagnet = magnets[currentMinute]; // Minutenball
            } else if (index === 2) {
                // Sekundenball: Bewegung entlang der Magneten
                let nextMagnetIndex = (ball.currentMagnet + 1) % 60;
                targetMagnet = magnets[nextMagnetIndex];

                let dx = targetMagnet.x - ball.x;
                let dy = targetMagnet.y - ball.y;
                let distance = sqrt(dx * dx + dy * dy);

                if (distance < 5) {
                    // Wenn der nächste Magnet erreicht wurde, aktualisiere den aktuellen Magnet
                    ball.currentMagnet = nextMagnetIndex;
                } else {
                    // Bewegung zum nächsten Magneten
                    let stepSize = 3; // Geschwindigkeit der Bewegung entlang der Magneten
                    ball.x += (dx / distance) * stepSize;
                    ball.y += (dy / distance) * stepSize;
                }
                return; // Für den Sekundenball ist die Logik hier abgeschlossen
            }

            // Bewegung zu den Zielmagneten (Stunden/Minuten)
            if (targetMagnet) {
                let dx = targetMagnet.x - ball.x;
                let dy = targetMagnet.y - ball.y;
                let distance = sqrt(dx * dx + dy * dy);

                if (distance > 5) {
                    let stepSize = 5;
                    ball.x += (dx / distance) * stepSize;
                    ball.y += (dy / distance) * stepSize;
                } else {
                    // Ziel erreicht
                    ball.x = targetMagnet.x;
                    ball.y = targetMagnet.y;
                }
            }
        }
    });
}

function mousePressed() {
    // Setze alle Bälle auf "toCentral", um sie zum zentralen Magneten zu bewegen
    balls.forEach((ball) => {
        ball.toCentral = true;
    });
}

// Center the canvas
function centerCanvas(canvas) {
    canvas.style('position', 'absolute');
    canvas.style('top', '50%');
    canvas.style('left', '50%');
    canvas.style('transform', 'translate(-50%, -50%)');
}
