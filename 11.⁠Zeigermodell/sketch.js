// Matter.js Module
let Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body;

let engine, world;
let secondsCircles = [];
let minutesCircles = [];
let wave = [];

let wavePoints = 12; 
let radiusPrimary = 20; 
let amplitudePrimary = 100; 
let frequencyPrimary = 0.5; 
let startX, startY; 
let gapX = 80; 

let lastSecond = -1; 

function setup() {
    createCanvas(960, 960);

    engine = Engine.create();
    world = engine.world;

    let ground = Bodies.rectangle(width / 2, height + 100, width + 200, 200, { isStatic: true });
    World.add(world, ground);

    let leftWall = Bodies.rectangle(-50, height / 2, 100, height, { isStatic: true });
    let rightWall = Bodies.rectangle(width + 50, height / 2, 100, height, { isStatic: true });
    World.add(world, [leftWall, rightWall]);

    let ceiling = Bodies.rectangle(width / 2, -100, width + 200, 200, { isStatic: true });
    World.add(world, ceiling);

    startX = (width - (wavePoints - 1) * gapX) / 2;
    startY = height / 2;

    let currentTime = new Date();
    let seconds = currentTime.getSeconds();
    for (let i = 0; i < seconds; i++) {
        addWhiteCircle(currentTime.getHours());
    }
    lastSecond = seconds;

    let minutes = currentTime.getMinutes();
    for (let i = 0; i < minutes; i++) {
        addGrayCircle();
    }

    for (let i = 0; i < wavePoints; i++) {
        let x = startX + i * gapX;
        let y = startY;
        let circle = Bodies.rectangle(x, y, 100, 80, {
            restitution: 0.8, isStatic: true
        });
        wave.push(circle);
        World.add(world, circle);
    }
}

function draw() {
    background('black');
    noStroke();

    Engine.update(engine);

    let currentTime = new Date();
    let millis = currentTime.getMilliseconds();
    let seconds = currentTime.getSeconds();
    let minutes = currentTime.getMinutes();
    let hours = currentTime.getHours();

    setGravityBasedOnTime(hours);

    if (seconds !== lastSecond) {
        addWhiteCircle(hours);
        lastSecond = seconds;

        if (seconds === 0) {
            resetSecondCircles();
            addGrayCircle();
        }
    }

    for (let i = 0; i < wavePoints; i++) {
        let x = startX + i * gapX;
        let angle = radians(millis * 0.36) + i * frequencyPrimary;
        let y = startY + Math.sin(angle) * amplitudePrimary;

        if (i === hours % 12) {
            drawHourLoadingAnimation(x, y, minutes, seconds); // Ladeanimation statt Kreis
        } else {
            if (i < hours % 12) {
                fill('#FF8362');
                stroke('#FF8362');
                strokeWeight(3);
            } else {
                fill('black');
                stroke('#FF8362');
                strokeWeight(3);
            }
            ellipse(x, y, 70);
        }

        Body.setPosition(wave[i], { x: x, y: y });
    }

    fill('lightgrey');
    noStroke();
    for (let circle of secondsCircles) {
        let pos = circle.position;
        ellipse(pos.x, pos.y, circle.circleRadius * 2);
    }

    fill('lightgrey');
    noStroke();
    for (let circle of minutesCircles) {
        let pos = circle.position;
        ellipse(pos.x, pos.y, circle.circleRadius * 2);
    }
}

function addWhiteCircle(currentHour) {
    let yPosition;
    if (currentHour >= 0 && currentHour < 12) {
        yPosition = startY - amplitudePrimary - 20;
    } else {
        yPosition = -20;
    }

    let circle = Bodies.circle(random(0, width), yPosition, radiusPrimary, {
        restitution: 1
    });
    secondsCircles.push(circle);
    World.add(world, circle);
}

function resetSecondCircles() {
    for (let circle of secondsCircles) {
        World.remove(world, circle);
    }
    secondsCircles = [];
}

function addGrayCircle() {
    let startingY = startY + amplitudePrimary + 20;
    let circle = Bodies.circle(random(0, width), startingY, radiusPrimary * 1.5, {
        restitution: 1
    });
    minutesCircles.push(circle);
    World.add(world, circle);
}

function setGravityBasedOnTime(hours) {
    if (hours >= 0 && hours < 12) {
        engine.gravity.y = -1;
    } else {
        engine.gravity.y = 1;
    }
}

// Ladeanimation für die aktuelle Stunde in der Sinuskurve
function drawHourLoadingAnimation(x, y, minutes, seconds) {
    let progress = (minutes * 60 + seconds) / 3600; 
    let maxRadius = 35;
    let filledRadius = progress * maxRadius;

    stroke('#FF8362');
    noFill();
    ellipse(x, y, maxRadius * 2);

    fill('#FF8362');
    noStroke();
    ellipse(x, y, filledRadius * 2);
}