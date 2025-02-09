// Matter.js-Variablen
let engine;
let world;
let polygon;
let circles = [];
let lastCircleTime = 0;
let circleInterval = 60; // Intervall für das Erstellen von Kreisen in Frames (1 Sekunde bei 60 FPS)
let startTime;
let cycleState = 'start'; // Zustand des Zyklus: 'start', 'red', 'reset'
let notificationShown = false; // Um sicherzustellen, dass die Benachrichtigung nur einmal erscheint
let notificationTime = 0; // Zeit, wann die Benachrichtigung angezeigt wurde
let lastResetTime = 0; // Letzte Zeit, zu der der Reset der Kreise stattgefunden hat

function setup() {
  createCanvas(960, 960);

  // Matter.js Engine und Welt initialisieren
  engine = Matter.Engine.create();
  world = engine.world;

  // Initialisiere das Polygon-Objekt
  polygon = new Polygon([
    createVector(0, 404.74),
    createVector(96.64, 252.12),
    createVector(143.41, 103.29),
    createVector(161.87, 105.77),
    createVector(168.18, 53.03),
    createVector(227.67, 53.03),
    createVector(237.3, 13.9),
    createVector(285.55, 0),
    createVector(292.7, 68.13),
    createVector(240.83, 149.48),
    createVector(245.85, 162.54),
    createVector(227.22, 322.03),
    createVector(188.08, 442.4),
    createVector(196.5, 494.65),
    createVector(147.96, 597.86),
    createVector(146.1, 665.14),
    createVector(134.1, 680.82),
    createVector(110.13, 773.61),
    createVector(89.75, 789.84),
    createVector(61.1, 627.1),
    createVector(44.65, 584.74),
    createVector(30.83, 485.5),
    createVector(0, 404.74)
  ]);

  // Zentriere das Polygon auf dem Canvas
  polygon.centerShape();

  // Setze die Startzeit
  startTime = millis();

  // Start Matter.js Engine
  Matter.Engine.run(engine);

  // Erstelle Wände um das Canvas (falls benötigt)
  createWalls();
}

function draw() {
  background(255);



  // Berechne die verstrichene Zeit
  let elapsedTime = millis() - startTime;

  // Berechne, ob wir 60 Sekunden erreicht haben und wenn ja, resetten wir die Kreise
  if (elapsedTime - lastResetTime >= 60000) {  // Alle 60 Sekunden
    lastResetTime = elapsedTime; // Speichere die Zeit des letzten Resets
    circles = []; // Lösche alle Kreise
    notificationShown = false; // Benachrichtigung zurücksetzen
  }

  // Zeige eine Benachrichtigung nach 1 Minute und 5 Sekunden
  if (elapsedTime >= 65000 && !notificationShown) {
    notificationTime = millis(); // Setze die Benachrichtigungszeit
    showPopup(); // Pop-up anzeigen
    notificationShown = true; // Setze das Flag, damit keine weitere Benachrichtigung mehr angezeigt wird
  }

  // Wenn mehr als 2 Sekunden vergangen sind, schließe die Benachrichtigung
  if (notificationShown && millis() - notificationTime > 2000) {
    notificationShown = false;
  }

  // Ändere den Zustand des Polygons bei 55 Sekunden (rot)
  if (elapsedTime >= 55000 && elapsedTime < 60000) {
    cycleState = 'red'; // Polygon wird rot
  } else if (elapsedTime >= 60000) {
    cycleState = 'reset'; // Alles wird zurückgesetzt
    notificationShown = false; // Benachrichtigung zurücksetzen
  } else {
    cycleState = 'start'; // Normaler Zustand
  }

  // Polygon zeichnen
  if (cycleState === 'red') {
    fill(255, 0, 0); // Rot, wenn der Zustand "red" ist
  } else {
    fill(0); // Schwarz, wenn der Zustand "start" ist
  }

  noStroke();
  polygon.draw();

  // Generiere neue rote Kreise alle Sekunde
  let currentTime = millis();
  if (currentTime - lastCircleTime > 1000) { // Alle 1 Sekunde
    lastCircleTime = currentTime;
    addRandomCircle(); // Einen neuen zufälligen Kreis hinzufügen
  }

  // Zeichne alle roten Kreise
  for (let circle of circles) {
    fill(255, 0, 0); // Rote Farbe
    noStroke();
    ellipse(circle.x, circle.y, circle.radius * 2);
  }

  // Zeige die verstrichene Zeit (Uhrzeit) im Format "hh:mm:ss" an
  let hours = Math.floor(elapsedTime / 3600000); // Stunden
  let minutes = Math.floor((elapsedTime % 3600000) / 60000); // Minuten
  let seconds = Math.floor((elapsedTime % 60000) / 1000); // Sekunden
  let formattedTime = nf(hours, 2) + ':' + nf(minutes, 2) + ':' + nf(seconds, 2); // Formatieren der Zeit

  textSize(24);
  fill(0);
  textAlign(LEFT, TOP);
  text('Zeit: ' + formattedTime, 10, 10); // Zeigt die Zeit in der linken oberen Ecke an

  // Zeige "All eyes on Palestina" unter der Uhrzeit an
  textSize(18);
  text("All eyes on Palestina", 10, 40); // Direkt unter der Zeit
}

// Funktion zum Erstellen von Wänden um das Canvas
function createWalls() {
  let options = { isStatic: true, restitution: 1 }; // Die Wände sind statisch und haben eine hohe Rückprallrate

  // Oben, rechts, unten und links
  let topWall = Matter.Bodies.rectangle(width / 2, 0, width, 100, options); // obere Wand
  let bottomWall = Matter.Bodies.rectangle(width / 2, height, width, 10, options); // untere Wand
  let leftWall = Matter.Bodies.rectangle(0, height / 2, 100, height, options); // linke Wand
  let rightWall = Matter.Bodies.rectangle(width, height / 2, 100, height, options); // rechte Wand

  // Wände zur Welt hinzufügen
  Matter.World.add(world, [topWall, bottomWall, leftWall, rightWall]);
}

// Funktion, um einen zufälligen Kreis innerhalb des Polygons hinzuzufügen
function addRandomCircle() {
  let radius = random(10, 30); // Zufälliger Radius für den Kreis
  let validPosition = false;
  let pos;

  // Suche nach einer gültigen Position innerhalb des Polygons
  while (!validPosition) {
    pos = polygon.randomPointInsidePolygon(radius); // Position innerhalb des Polygons

    // Überprüfe, ob der Kreis innerhalb des Polygons und ohne Überlappung liegt
    if (polygon.isPointInsideWithRadius(pos, radius)) {
      circles.push({ x: pos.x, y: pos.y, radius: radius });
      validPosition = true;
    }
  }
}

// Polygon-Klasse
class Polygon {
  constructor(vertices) {
    this.vertices = vertices;
  }

  // Funktion zum Zeichnen des Polygons
  draw() {
    beginShape();
    for (let v of this.vertices) {
      vertex(v.x, v.y);
    }
    endShape(CLOSE);
  }

  // Funktion zum Zentrieren des Polygons
  centerShape() {
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    for (let v of this.vertices) {
      minX = min(minX, v.x);
      minY = min(minY, v.y);
      maxX = max(maxX, v.x);
      maxY = max(maxY, v.y);
    }

    let centerX = (minX + maxX) / 2;
    let centerY = (minY + maxY) / 2;

    let offsetX = width / 2 - centerX;
    let offsetY = height / 2 - centerY;

    for (let v of this.vertices) {
      v.x += offsetX;
      v.y += offsetY;
    }
  }

  // Funktion, um einen zufälligen Punkt im Polygon zu finden
  randomPointInsidePolygon(radius) {
    let point;
    do {
      point = createVector(random(width), random(height));
    } while (!this.isPointInsideWithRadius(point, radius)); // Stelle sicher, dass der Punkt im Polygon liegt
    return point;
  }

  // Funktion zum Prüfen, ob ein Punkt innerhalb des Polygons liegt und der Kreis nicht über den Rand hinausragt
  isPointInsideWithRadius(point, radius) {
    let inside = false;
    let x = point.x;
    let y = point.y;

    // Überprüfe, ob der gesamte Kreis innerhalb des Polygons liegt
    for (let i = 0, j = this.vertices.length - 1; i < this.vertices.length; j = i++) {
      let xi = this.vertices[i].x, yi = this.vertices[i].y;
      let xj = this.vertices[j].x, yj = this.vertices[j].y;

      let intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }

    if (!inside) return false;

    // Überprüfe, ob der Kreis über den Rand hinausragt
    for (let i = 0; i < this.vertices.length; i++) {
      let nextIndex = (i + 1) % this.vertices.length;
      let start = this.vertices[i];
      let end = this.vertices[nextIndex];

      // Berechne den Abstand vom Punkt zum Rand des Polygons
      let d = distToLineSegment(start.x, start.y, end.x, end.y, x, y);
      if (d < radius) {
        return false; // Der Kreis überschreitet den Rand
      }
    }

    return true;
  }
}

// Funktion zum Berechnen des Abstands von einem Punkt zu einer Linie (Segment)
function distToLineSegment(x1, y1, x2, y2, x, y) {
  let A = x - x1;
  let B = y - y1;
  let C = x2 - x1;
  let D = y2 - y1;

  let dot = A * C + B * D;
  let len_sq = C * C + D * D;
  let param = -1;
  if (len_sq != 0) { // Vermeide Division durch Null
    param = dot / len_sq;
  }

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  let dx = x - xx;
  let dy = y - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

// Funktion, um das Pop-up zu zeigen
function showPopup() {
  alert("1 notification, all eyes on Palestina");
}
