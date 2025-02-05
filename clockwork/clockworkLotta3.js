let Engine = Matter.Engine;
let World = Matter.World;
let Bodies = Matter.Bodies;
let Runner = Matter.Runner;
let Constraint = Matter.Constraint;
let Body = Matter.Body;

let engine;
let runner;
let world;

let radius = 350; // Radius of the outer circle
let secondBalls = [];
let balls = [];
let centralMagnet;
let secondBallsAttracted = false; // State for second balls attraction

// METABALLS
let metaballs;

function setup() {
    let canvas = createCanvas(960, 960);
    centerCanvas(canvas);

    engine = Engine.create();
    runner = Runner.create({ isFixed: true, delta: 1000 / 60 });
    world = engine.world;
    engine.gravity.y = 0;

    new BlocksFromSVG(world, 'clock.svg', [],
        { isStatic: true, restitution: 0.0, friction: 0.0, frictionAir: 0.0 },
        {
          save: false, sample: 40, offset: { x: -100, y: -100 }, done: (added, time, fromCache) => {
            console.log('FRAME', added, time, fromCache)
          }
        });

    let count = 60; // 60 outer magnets
    secondBalls = [];

    // Create the outer balls
    for (let i = 0; i < count; i++) {
        let angle = map(i, 0, count, -PI / 2, 3 * PI / 2);
        let x = width / 2 + radius * cos(angle);
        let y = height / 2 + radius * sin(angle);

        let magnet = { x, y, initialX: x, initialY: y, index: i };
        secondBalls.push(magnet);
    }

    // Create the central magnet, attraction definiert die Anziehungskraft
    centralMagnet = new Magnet(
        world,
        {
            x: width / 2, y: height / 2, r: 40,
            color: 'blue',
            attraction: 0.1e-3
        },
        { isStatic: true }
    );
    centralMagnet.isActive = false;

    // Create the balls and magnets for hours, minutes, and seconds
    let sizes = [120, 80, 60]; // Sizes for hours, minutes, seconds
    const time = [
        ((hour() % 12) / 12 + minute() / 720) * 2 * Math.PI - Math.PI / 2, // Hours interpolation
        (minute() / 60) * 2 * Math.PI - Math.PI / 2,
        (second() / 60) * 2 * Math.PI - Math.PI / 2
    ];
    for (let i = 0; i < 3; i++) {
        let x = width / 2;
        let y = height / 2;

        let attractionStrength = 0.03e-3; // Reduce attraction for smoother movement

        let ball = {
            x,
            y,
            magnet: new Magnet(
                world,
                {
                    x: width / 2 + radius * Math.cos(time[i]),
                    y: height / 2 + radius * Math.sin(time[i]),
                    r: sizes[i] / 4,
                    color: 'blue',
                    attraction: attractionStrength
                },
                { isStatic: true, isSensor: true }
            ),
            body: Bodies.circle(x, y, sizes[i] / 2, {
                restitution: 0.5,
                friction: 0,
                frictionAir: 0.01, // Allow smooth motion
                density: 0.01,
                collisionFilter: {
                    group: -1 // Prevent collisions between balls
                }
            }),
            size: sizes[i]
        };
        World.add(world, ball.body);
        balls.push(ball);
        ball.magnet.addAttracted(ball.body);
        centralMagnet.addAttracted(ball.body);
    }

    // METABALLS
    metaballs = new Metaballs(0.08, 0.01, 1000, 20, 0.10);

    Runner.run(runner, engine);
}

function draw() {
    background(0);
    noStroke();



    
    // Central magnet attract logic but no visual rendering
    centralMagnet.attract();
    if (centralMagnet.isActive) {
        Body.setPosition(centralMagnet.body, {
            x: mouseX,
            y: mouseY
        });
    }

    const time = [
        ((hour() % 12) / 12 + minute() / 720) * 2 * Math.PI - Math.PI / 2, // Hours interpolation
        (minute() / 60) * 2 * Math.PI - Math.PI / 2,
        (second() / 60) * 2 * Math.PI - Math.PI / 2
    ];

    balls.forEach((ball, i) => {
        Body.setPosition(ball.magnet.body, {
            x: width / 2 + (radius - 0) * Math.cos(time[i]),
            y: height / 2 + (radius - 0) * Math.sin(time[i])
        });
        ball.magnet.attract();

        // Change fill color for hour, minute, and second balls
        fill(0, 255, 255);
        ellipse(ball.body.position.x, ball.body.position.y, ball.size);
    });

    // METABALLS rendering
    fill(0, 255, 255);
    metaballs.draw(balls.map(ball => ({ ...ball.body.position, radius: ball.size })), 180, 100);

    // Draw outer balls and make them move toward or away from the central magnet
    secondBalls.forEach((ball, s) => {
        let targetX = secondBallsAttracted ? width / 2 : ball.initialX;
        let targetY = secondBallsAttracted ? height / 2 : ball.initialY;
        ball.x = lerp(ball.x, targetX, 0.05);
        ball.y = lerp(ball.y, targetY, 0.05);

        if (s == second()) {
            fill(255);
        } else {
            fill(80);
        }
        noStroke();
        ellipse(ball.x, ball.y, 10);
    });
}

function mousePressed() {
    // Umschalten Central / nicht Central angezogen
    centralMagnet.isActive = !centralMagnet.isActive;
    balls.forEach((ball) => {
        ball.magnet.isActive = !ball.magnet.isActive;
    });
    // Toggle attraction state for secondBalls
    secondBallsAttracted = !secondBallsAttracted;
}

// Center the canvas
function centerCanvas(canvas) {
    canvas.style('position', 'absolute');
    canvas.style('top', '50%');
    canvas.style('left', '50%');
    canvas.style('transform', 'translate(-50%, -50%)');
}
