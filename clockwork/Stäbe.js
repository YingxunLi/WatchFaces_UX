// Variablen für Matter.js
let engine;
let world;
let circle;

// Variablen für die Kugeln
let numBalls = 60;
let balls = [];
let maxDistance = 400; // Der Abstand des äußersten Kreises (außen)
let angleSpeed = 0.02; // Geschwindigkeit der Drehung im Uhrzeigersinn

// Magnetische Kräfte
let attractionForce = 0.02; // Stärke der Anziehungskraft zum äußersten Kreis
let repulsionForce = 0.05; // Stärke der Abstoßungskraft, wenn der Rand erreicht wird
let radiusThreshold = 50; // Schwellenwert, um den Rand nicht zu berühren

function setup() {
  createCanvas(1280, 1280); // Vergrößertes Canvas
  
  // Matter.js Engine initialisieren
  engine = Matter.Engine.create();
  world = engine.world;

  // Großen Kreis erstellen (Outer Circle)
  let options = {
    isStatic: true // Der Kreis wird nicht bewegt
  };
  circle = Matter.Bodies.circle(width / 2, height / 2, maxDistance, options);
  Matter.World.add(world, circle);

  // Füge die Kugeln zum Start hinzu
  for (let i = 0; i < numBalls; i++) {
    balls.push({
      angle: random(TWO_PI), // Zufälliger Startwinkel im Bereich des äußeren Rings
      speedY: 0, // Anfangsgeschwindigkeit der Kugel
    });
  }
}

function draw() {
  // Hintergrund schwarz färben
  background(0);

  // Matter.js Engine aktualisieren
  Matter.Engine.update(engine);

  // Äußere Ellipse (Ring außen)
  stroke(255); // Weiße Farbe für den äußeren Ring
  strokeWeight(10); // Dickere Kontur
  noFill();
  ellipse(circle.position.x, circle.position.y, maxDistance * 2, maxDistance * 2); // Äußerer Kreis

  // Kugeln um den äußeren Kreis bewegen und Magnetismus anwenden
  for (let i = 0; i < balls.length; i++) {
    let ball = balls[i];

    // Berechne die Position der Kugel entlang des äußeren Kreises
    let x = circle.position.x + maxDistance * cos(ball.angle);
    let y = circle.position.y + maxDistance * sin(ball.angle);

    // Berechne den Abstand zum Mittelpunkt des Kreises
    let distanceToCenter = dist(ball.x, ball.y, circle.position.x, circle.position.y);

    // Magnetische Anziehung oder Abstoßung
    if (distanceToCenter < maxDistance - radiusThreshold) {
      // Kugel wird zum äußeren Kreis hin angezogen
      ball.speedY += attractionForce; // Stärker zuziehen
    } else if (distanceToCenter > maxDistance + radiusThreshold) {
      // Kugel wird vom äußeren Kreis weg abgedrängt
      ball.speedY -= repulsionForce; // Abstoßung
    }

    // Kugel bewegen im Uhrzeigersinn entlang des äußeren Kreises
    ball.angle += angleSpeed + ball.speedY;

    // Setze die Kugelposition auf die berechneten x- und y-Werte des äußeren Kreises
    ball.x = x;
    ball.y = y;
    
    // Kugel zeichnen (rot)
    fill(255, 0, 0); // Farbe der Kugeln (rot)
    noStroke(); // Keine Kontur für die Kugeln
    ellipse(x, y, 40, 40); // Durchmesser der Kugeln (40)
  }

  // Füge alle 60 Sekunden eine neue Kugel hinzu
  if (frameCount % 60 === 0 && balls.length < numBalls) {
    // Neue Kugel, die von oben fällt
    balls.push({
      x: width / 2, // Startposition oben im Zentrum des Canvas
      y: -40, // Startposition außerhalb des Canvas (oben)
      radius: 40, // Festgelegter Radius
      speedY: 0, // Startgeschwindigkeit in Y-Richtung
      angle: random(TWO_PI), // Zufälliger Startwinkel im Bereich des äußeren Rings
    });
  }
}
