let digits = [];
let Engine = Matter.Engine;
let World = Matter.World;
let Bodies = Matter.Bodies;
let Body = Matter.Body;
let engine;
let world;
let circles = []; // Array zum Speichern der Kreise
let paths = []; // Array zum Speichern der Pfade der Kreise
let frameStep = 5; // Anzahl der Frames zwischen neuen Kreispunkten in den Pfaden
let traceLifetime = 6000; // Lebensdauer der Spuren in Millisekunden
let baseCircleRadius = 80; // Basisgröße des Kreises
let maxSpeed = 10; // Maximalgeschwindigkeit für Skalierung

function preload() {
    for (let i = 0; i < 10; i++) {
        digits[i] = loadImage('Watchface Zahlen/' + i + '.svg');
    }
}

function setup() {
    createCanvas(960, 960);
    engine = Engine.create();
    world = engine.world;


  // reset gravity to zero for start, gravity will be controlled by motion
  engine.gravity.y = 0;


    // Erstelle den weißen Kreis
    for (let i = 0; i < 1; i++) {
        let circle = Bodies.circle(random(100, width - 100), 100, baseCircleRadius, { // Basisgröße des Kreises
            restitution: 1.2 // Erhöhter Bounciness-Wert
        });
        World.add(world, circle);
        circles.push(circle);
        paths.push([]); // Erstelle ein leeres Array pro Kreis für die Positionen
    }

    // Erstelle unsichtbare Barrieren
    let ground = Bodies.rectangle(width / 2, height + 5, width, 10, { isStatic: true });
    let leftWall = Bodies.rectangle(-5, height / 2, 10, height, { isStatic: true });
    let rightWall = Bodies.rectangle(width + 5, height / 2, 10, height, { isStatic: true });
    let ceiling = Bodies.rectangle(width / 2, -5, width, 10, { isStatic: true });

    World.add(world, [ground, leftWall, rightWall, ceiling]);
}

function draw() {
    background(0);


  // apply rotation of device to gravity
  engine.gravity.x = (rotationY / 2 - engine.gravity.x) * 0.5;
  engine.gravity.y = (rotationX / 2 - engine.gravity.y) * 0.5;
  


    // Berechne die Richtung der Gravitationskraft basierend auf der Mausposition
    let mousePosition = createVector(mouseX, mouseY);
    let gravityDir = createVector(0, 0);

    // Berechne Summenvektor zur Bestimmung der mittleren Gravitationsrichtung
    circles.forEach(circle => {
        let circlePosition = createVector(circle.position.x, circle.position.y);
        let gravityDirection = p5.Vector.sub(mousePosition, circlePosition);
        gravityDir.add(gravityDirection);
    });

    // Normalisiere den Summenvektor
    gravityDir.normalize();

    // Setze die Schwerkraftsrichtung der Engine entsprechend
    engine.world.gravity.x = gravityDir.x;
    engine.world.gravity.y = gravityDir.y;

    // Berechne die Geschwindigkeit des Kreises und passe den Radius an
    circles.forEach(circle => {
        let velocity = circle.velocity;
        let speed = velocity.x * velocity.x + velocity.y * velocity.y; // Geschwindigkeit als Betrag des Geschwindigkeitsvektors
        let newRadius = baseCircleRadius + map(speed, 0, maxSpeed * maxSpeed, 0, 50); // Skalierung des Radius
        circle.circleRadius = newRadius; // Speichern der neuen Größe
    });

    // Aktualisiere die Matter.js Engine
    Engine.update(engine);

    // Zeichne die Spur von Kreisen
    stroke(0);
    strokeWeight(0);
    fill(0, 255, 255);
    if (frameCount % frameStep === 0) {
        paths.forEach((path, i) => {
            let circlePos = createVector(circles[i].position.x, circles[i].position.y);
            let velocity = circles[i].velocity;
            let speed = velocity.x * velocity.x + velocity.y * velocity.y;
            let size = map(speed, 0, maxSpeed * maxSpeed, baseCircleRadius * 2, baseCircleRadius * 3); // Größe der Spur basierend auf Geschwindigkeit
            path.push({ pos: circlePos, size: size, time: millis() }); // Speichern der Position und Größe
        });
    }

    paths.forEach((path, i) => {
        // Filtere die Punkte, die älter als die Lebensdauer sind
        paths[i] = path.filter(trace => millis() - trace.time < traceLifetime);

        // Zeichne die verbleibenden Punkte
        paths[i].forEach(trace => {
            let ageFactor = 1 - (millis() - trace.time) / traceLifetime; // Alterungsfaktor (1 = neu, 0 = abgelaufen)
            let currentSize = trace.size * ageFactor; // Größe abhängig vom Alter
            ellipse(trace.pos.x, trace.pos.y, currentSize, currentSize); // Zeichne die Spur mit aktueller Größe
        });
    });

    // Füge Umrandung für die Hauptkreise hinzu
    stroke(0);
    strokeWeight(2);
    fill(255);
    circles.forEach(circle => {
        ellipse(circle.position.x, circle.position.y, circle.circleRadius * 2, circle.circleRadius * 2); // Zeichne den Kreis mit der aktuellen Größe
    });

    // Hole die aktuelle Uhrzeit
    let h = nf(hour(), 2);
    let m = nf(minute(), 2);

    // Zeichne die Stunden
    let x = 130;
    let hourY = 50; // Neue y-Position für Stunden
    for (let i = 0; i < h.length; i++) {
        let digit = int(h[i]);
        image(digits[digit], x, hourY, 300, 500);
        x += 300 + 60; // Abstand von 20 zwischen den SVGs
    }

    // Zeichne die Minuten
    x = 290;
    let minuteY = 610; // Ursprüngliche y-Position für Minuten
    for (let i = 0; i < m.length; i++) {
        let digit = int(m[i]);
        image(digits[digit], x, minuteY, 180, 240);
        x += 200 + 10;
    }
}
