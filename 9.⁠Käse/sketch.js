Matter.use('matter-wrap');

let engine, world;
let circles = [];
let numCircles = 36;
let radius = 47; // Radius der Kreise
let layer2;

function setup() {
  const canvasSize = 960; // Quadratförmiger Canvas
  createCanvas(canvasSize, canvasSize);
  background('white'); // Weißer Hintergrund

  // Erstelle Matter.js Engine
  engine = Matter.Engine.create();
  world = engine.world;
  world.gravity.x = 0;
  world.gravity.y = 0; // Schwerkraft deaktiviert

  // Layer 2
  layer2 = createGraphics(canvasSize, canvasSize);

  // Erstelle Kreise mit Matter.js
  for (let i = 0; i < numCircles; i++) {
    let x = random(radius, width - radius);
    let y = random(radius, height - radius);
    let velocity = { x: random(-5, 5), y: random(-5, 5) };
    let circle = Matter.Bodies.circle(x, y, radius, {
      restitution: 0.0, // Perfektes Abprallen
      friction: 1.0,
      frictionAir: 0,
      
    });

    // Setze die Anfangsgeschwindigkeit
    Matter.Body.setVelocity(circle, velocity);

    Matter.World.add(world, circle);
    circles.push(circle);
  }

  // Erstelle die Frame-Grenzen
  createFrame(world);

  // Starte die Engine
  Matter.Runner.run(engine);
}

function draw() {
  // Hintergrund für die Hauptdarstellung
  background('white');

  // Uhrzeit anzeigen
  displayTime();

  // Aktualisiere und zeichne Layer 2
  layer2.clear(); // Lösche den Inhalt von Layer 2
  layer2.background('black'); // Orangefarbener Hintergrund für Layer 2

  // Maskierte Kreise auf Layer 2 zeichnen
  layer2.erase(); // Aktiviert das Löschen (Maskierung)
  layer2.fill(255); // Weiß für Maskierung
  for (let circle of circles) {
    const pos = circle.position;
    layer2.ellipse(pos.x, pos.y, 2 * radius);
  }
  layer2.noErase(); // Beendet das Löschen

  // Zeichne Layer 2 über dem Haupt-Canvas
  image(layer2, 0, 0); // Zeichne Layer 2 auf die Hauptfläche

  engine.gravity.x = (rotationY / 2 - engine.gravity.x) * 0.5;
  engine.gravity.y = (rotationX / 2 - engine.gravity.y) * 0.5;

}

function createFrame(world) {
  const thickness = 50; // Dicke der Begrenzungen
  const options = {
    isStatic: true,
    restitution: 1.0,
    friction: 0
  };

  // Füge Begrenzungen hinzu
  Matter.World.add(world, [
    Matter.Bodies.rectangle(width / 2, -thickness / 2, width, thickness, options), // Oben
    Matter.Bodies.rectangle(width / 2, height + thickness / 2, width, thickness, options), // Unten
    Matter.Bodies.rectangle(-thickness / 2, height / 2, thickness, height, options), // Links
    Matter.Bodies.rectangle(width + thickness / 2, height / 2, thickness, height, options) // Rechts
  ]);
}

let myFont; // Variable für die Schriftart

function preload() {
  // Lade die Schriftart (Pfad anpassen, falls nötig)
  myFont = loadFont('Nunito-Black.ttf');
}


function displayTime() {
  strokeWeight(5);
  let min = minute();
  let hrs = hour();
  min = formatting(min);
  hrs = formatting(hrs);

  // Schriftart anwenden
  textFont(myFont); // Setze die Schriftart
  fill('black'); // Farbe der Zahlen
  textSize(300); // Große Schriftgröße
  textAlign(CENTER, CENTER);
  text(hrs + ":" + min, width / 2, height / 2);
}

function formatting(num) {
  return int(num) < 10 ? "0" + num : num;
}
