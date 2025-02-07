let cols, rows;
let cellSize = 20;
let offset = 0; // Offset für die Schlangenbewegung
let magnets = []; // Magnete auf der Uhrzeit
let magnetRadius = 100; // Radius der Magnetwirkung
let targetPoints = [];

function setup() {
  createCanvas(960, 960);
  cols = floor(width / cellSize);
  rows = floor(height / cellSize);
  frameRate(15); // Geschwindigkeitssteuerung

  // Initialisiere die Magnete basierend auf der Uhrzeit
  let currentTime = nf(hour(), 2) + ':' + nf(minute(), 2);
  targetPoints = getTextPoints(currentTime, width / 4, height / 2, 200);
  for (let pt of targetPoints) {
    magnets.push(createVector(pt.x, pt.y));
  }
}

function draw() {
  background(0); // Hintergrund ist jetzt schwarz
  stroke(255); // Linien und Punkte werden weiß
  strokeWeight(4);

  // Aktualisiere die Magneten basierend auf der Wellenbewegung
  for (let i = 0; i < targetPoints.length; i++) {
    let wave = sin((i + offset) * 0.5) * 20;
    magnets[i].y = targetPoints[i].y + wave;
  }

  // Zeichne die Magneten (Uhrzeit-Punkte) in Rot
  noStroke();
  fill(255, 0, 0);
  for (let target of magnets) {
    ellipse(target.x, target.y, 8);
  }

  // Zeichne den Hintergrund aus Spalten und Zeilen
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let x = i * cellSize + cellSize / 2;
      let y = j * cellSize + cellSize / 2;

      // Berechne eine Perlin-Noise-basierte Bewegung
      let wave = sin((i + offset) * 0.5) * cos((j + offset) * 0.5);

      // Magnetische Anziehung basierend auf Zielpunkten
      for (let magnet of magnets) {
        let magnetForce = createVector(x, y).sub(magnet);
        let distance = magnetForce.mag();

        if (distance < magnetRadius) {
          magnetForce.normalize();
          magnetForce.mult(-map(distance, 0, magnetRadius, 50, 0));
          x += magnetForce.x;
          y += magnetForce.y;
        }
      }

      // Zeichne basierend auf der Wellenform
      if (wave > 0.3) {
        line(x - cellSize / 4, y, x + cellSize / 4, y); // Horizontale Linie
      } else if (wave < -0.3) {
        line(x, y - cellSize / 4, x, y + cellSize / 4); // Vertikale Linie
      } else {
        point(x, y); // Punkt
      }
    }
  }

  // Verschiebe den Offset für die Bewegung
  offset += 0.1;
}

// Funktion, um Text in Punkte umzuwandeln
function getTextPoints(txt, x, y, fontSize) {
  let points = [];
  let textGraphic = createGraphics(width, height);
  textGraphic.pixelDensity(1);
  textGraphic.textFont('Arial');
  textGraphic.textSize(fontSize);
  textGraphic.fill(255);
  textGraphic.text(txt, x, y);

  textGraphic.loadPixels();
  for (let i = 0; i < textGraphic.width; i += 10) {
    for (let j = 0; j < textGraphic.height; j += 10) {
      let idx = 4 * (i + j * textGraphic.width);
      if (textGraphic.pixels[idx] > 128) {
        points.push({ x: i, y: j });
      }
    }
  }
  return points;
}