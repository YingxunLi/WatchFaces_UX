// Matter.js-Module importieren
const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Body = Matter.Body;
const Runner = Matter.Runner;

let engine, world, runner;
let gridLines = { vertical: [], horizontal: [] }; // Vertikale und horizontale Linien
let magnets = [];
let active = true; // Status, ob Magneten aktiv sind oder nicht
let pulseAlpha = 255; // Transparenzwert für den Puls
let pulseDirection = -1; // Richtung der Pulsanimation
let isAnimatingReset = false; // Status für animiertes Zurücksetzen des Grids
let pulseInterval = null; // Puls-Intervall
let colorTransitionProgress = 1; // **Neue Variable für sanften Farbverlauf**

const cols = 40; // Anzahl der vertikalen Linien
const rows = 40; // Anzahl der horizontalen Linien
const spacing = 960 / cols; // Abstand zwischen den Punkten im Gitter
let currentTime = { hours: 0, minutes: 0 };

function setup() {
  createCanvas(960, 960);

  // Matter.js Engine und Welt initialisieren
  engine = Engine.create();
  engine.world.gravity.y = 0; // Schwerkraft deaktivieren
  world = engine.world;
  runner = Runner.create();

  // Dynamische Linien erstellen
  createDynamicLines();

  // Matter.js Runner starten
  Runner.run(runner, engine);

  updateTime();
  // Uhrzeit alle 1 Minute aktualisieren
  setInterval(updateTime, 60000);
}

function keyPressed() {
  if (keyCode === 32) {
    active = !active;

    if (!active) {
      for (let magnet of magnets) {
        World.remove(world, magnet.body);
      }
      magnets = [];

      // Puls-Intervall starten
      startPulseInterval();

      // Starte sanften Farbwechsel zu (0, 79, 77)
      colorTransitionProgress = 0;
    } else {
      updateTime();

      // Puls-Intervall stoppen
      stopPulseInterval();

      // Starte sanften Farbwechsel zurück zu Weiß
      colorTransitionProgress = 1;
    }
  }
}

function draw() {
  background(20);

  //Sanfter Farbwechsel in beide Richtungen
  if (!active) {
    colorTransitionProgress = min(colorTransitionProgress + 0.02, 1); // Zu (0, 79, 77)
  } else {
    colorTransitionProgress = max(colorTransitionProgress - 0.02, 0); // Zurück zu Weiß
  }

  let lineColor = lerpColor(color(255), color(0, 79, 77), colorTransitionProgress);

  for (let line of [...gridLines.vertical, ...gridLines.horizontal]) {
    if (!active) {
      line.smoothReset(0.02); // **Linien zurückführen**
    }
    line.updateColor(color(lineColor.levels[0], lineColor.levels[1], lineColor.levels[2], pulseAlpha));
    line.update();
    line.draw();
  }

  if (active && !isAnimatingReset) {
    for (let magnet of magnets) {
      magnet.update();
      magnet.draw();
    }
  }

  if (!active) {
    animatePulse();
  }
}

// Funktion zum Starten des Puls-Intervalls
function startPulseInterval() {
  if (pulseInterval) clearInterval(pulseInterval); // Vorheriges Intervall stoppen

  pulseInterval = setInterval(() => {
    if (!active) {
      animatePulse();
    }
  }, 1000); // Alle Sekunde
}

// Funktion zum Stoppen des Puls-Intervalls
function stopPulseInterval() {
  if (pulseInterval) {
    clearInterval(pulseInterval);
    pulseInterval = null;
  }
}

// Puls-Animation (mit neuer Farbe)
function animatePulse() {
  pulseAlpha += pulseDirection * 5;

  // Richtung wechseln, wenn Grenzwerte erreicht sind
  if (pulseAlpha <= 128 || pulseAlpha >= 255) {
    pulseDirection *= -1;
  }
}

function createDynamicLines() {
  for (let i = 0; i <= cols; i++) {
    const x = i * spacing;
    gridLines.vertical.push(new FlexibleLine(x, 0, x, height));
  }

  for (let j = 0; j <= rows; j++) {
    const y = j * spacing;
    gridLines.horizontal.push(new FlexibleLine(0, y, width, y));
  }
}

function updateTime() {
  const now = new Date();
  currentTime.hours = now.getHours();
  currentTime.minutes = now.getMinutes();

  if (active) {
    startGridResetAnimation();
  }
}

function startGridResetAnimation() {
  isAnimatingReset = true;
  let animationProgress = 0;
  const animationSpeed = 0.05;

  function animateReset() {
    animationProgress += animationSpeed;
    for (let line of [...gridLines.vertical, ...gridLines.horizontal]) {
      line.smoothReset(animationProgress);
    }

    if (animationProgress >= 1) {
      isAnimatingReset = false;
      createTimeMagnets();
    } else {
      requestAnimationFrame(animateReset);
    }
  }

  animateReset();
}

function createTimeMagnets() {
  // Entferne bestehende Magneten
  for (let magnet of magnets) {
    World.remove(world, magnet.body);
  }
  magnets = [];

  const hourDigits = String(currentTime.hours).padStart(2, "0").split("");
  const minuteDigits = String(currentTime.minutes).padStart(2, "0").split("");

  const digitSpacing = width / 3.5; // Abstand zwischen Ziffern
  const baseYUpper = height / 4; // Y-Position für die obere Hälfte
  const baseYLower = (3 * height) / 4; // Y-Position für die untere Hälfte
  const baseX = width / 2.9; // Start X-Position (zentriert)

  // Stunden in der oberen Hälfte nebeneinander
  for (let i = 0; i < hourDigits.length; i++) {
    const x = baseX + i * digitSpacing;
    createDigitMagnet(hourDigits[i], x, baseYUpper);
  }

  // Minuten in der unteren Hälfte nebeneinander
  for (let i = 0; i < minuteDigits.length; i++) {
    const x = baseX + i * digitSpacing;
    createDigitMagnet(minuteDigits[i], x, baseYLower);
  }
}

function createDigitMagnet(digit, centerX, centerY) {
  const digitShapes = {
    "0": [[1, 1, 1], [1, 0, 1], [1, 0, 1], [1, 0, 1], [1, 1, 1]],
    "1": [[0, 1, 0], [1, 1, 0], [0, 1, 0], [0, 1, 0], [1, 1, 1]],
    "2": [[1, 1, 1], [0, 0, 1], [1, 1, 1], [1, 0, 0], [1, 1, 1]],
    "3": [[1, 1, 1], [0, 0, 1], [1, 1, 1], [0, 0, 1], [1, 1, 1]],
    "4": [[1, 0, 1], [1, 0, 1], [1, 1, 1], [0, 0, 1], [0, 0, 1]],
    "5": [[1, 1, 1], [1, 0, 0], [1, 1, 1], [0, 0, 1], [1, 1, 1]],
    "6": [[1, 1, 1], [1, 0, 0], [1, 1, 1], [1, 0, 1], [1, 1, 1]],
    "7": [[1, 1, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1]],
    "8": [[1, 1, 1], [1, 0, 1], [1, 1, 1], [1, 0, 1], [1, 1, 1]],
    "9": [[1, 1, 1], [1, 0, 1], [1, 1, 1], [0, 0, 1], [1, 1, 1]],
  };

  const grid = digitShapes[digit] || [];
  const segmentWidth = width / 15;
  const segmentHeight = height / 15;

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      if (grid[row][col] === 1) {
        const x = centerX + (col - 1) * segmentWidth;
        const y = centerY + (row - 2) * segmentHeight;
        magnets.push(new BarMagnet(x, y, segmentWidth, segmentHeight, "attract"));
      }
    }
  }
}

function animatePulse() {
  pulseAlpha += pulseDirection * 2.5;
  if (pulseAlpha <= 128 || pulseAlpha >= 255) {
    pulseDirection *= -1;
  }
}

class FlexibleLine {
  constructor(x1, y1, x2, y2) {
    this.start = { x: x1, y: y1 };
    this.end = { x: x2, y: y2 };
    this.segments = [];
    this.color = color(255);

    const segmentCount = 30;
    const dx = (x2 - x1) / segmentCount;
    const dy = (y2 - y1) / segmentCount;

    for (let i = 1; i < segmentCount; i++) {
      const segmentX = x1 + dx * i;
      const segmentY = y1 + dy * i;
      const body = Bodies.circle(segmentX, segmentY, 3, { isStatic: false });
      World.add(world, body);
      this.segments.push(body);
    }
  }

  smoothReset(step) {
    const dx = (this.end.x - this.start.x) / this.segments.length;
    const dy = (this.end.y - this.start.y) / this.segments.length;

    this.segments.forEach((segment, i) => {
      const targetX = this.start.x + dx * i;
      const targetY = this.start.y + dy * i;

      const currentX = segment.position.x;
      const currentY = segment.position.y;

      const newX = lerp(currentX, targetX, step);
      const newY = lerp(currentY, targetY, step);

      Body.setPosition(segment, { x: newX, y: newY });
    });
  }

  updateColor(newColor) {
    this.color = newColor;
  }

  update() {
    this.segments.forEach((segment) => {
      const pos = segment.position;
      segment.x = pos.x;
      segment.y = pos.y;
    });
  }

  draw() {
    noFill();
    beginShape();
    stroke(this.color);
    strokeWeight(1);
    vertex(this.start.x, this.start.y);

    for (let segment of this.segments) {
      vertex(segment.position.x, segment.position.y);
    }

    vertex(this.end.x, this.end.y);
    endShape();
  }
}

class BarMagnet {
  constructor(x, y, width, height, type) {
    this.body = Bodies.rectangle(x, y, width, height, { isStatic: true });
    this.width = width;
    this.height = height;
    this.type = type;
    World.add(world, this.body);
  }

  update() {
    const pos = this.body.position;

    for (let line of [...gridLines.vertical, ...gridLines.horizontal]) {
      for (let segment of line.segments) {
        const distance = dist(pos.x, pos.y, segment.position.x, segment.position.y);
        if (distance < 100) {
          const force = createVector(segment.position.x - pos.x, segment.position.y - pos.y)
            .normalize()
            .mult(this.type === "attract" ? -0.000001 : 0.000001);
          Body.applyForce(segment, segment.position, force);
        }
      }
    }
  }

  draw() {
    const pos = this.body.position;
    noStroke();
    rectMode(CENTER);
    rect(pos.x, pos.y, this.width, this.height);
  }
}