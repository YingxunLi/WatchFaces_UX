let objects = [];  // Array, um alle Objekte (Sets von Kreisen) zu speichern
let scaleFactor = 0.3;  // Skalierungsfaktor für größere Kreise
let maxObjects = 60; // Maximale Anzahl von Objekten (60 Sekunden)
let clockRadius = 350;  // Radius der analogen Uhr

let gravity = 0.5;  // Schwerkraft (wie schnell die Kreise fallen)
let fallSpeeds = []; // Array, um die Fallgeschwindigkeit jedes Objekts zu speichern
let isFalling = false; // Flag, um zu überprüfen, ob die Kreise fallen sollen
let fallingCircles = []; // Array für Kreise, die fallen und grau werden sollen
let elapsedTime = 0;
let devAccX = 0;
let devAccY = 0;
let devAccZ = 0;

// Ursprungspositionen der Objekte
let originalPositions = [];

function setup() {
  createCanvas(920, 920);
  noFill();  // Keine Füllung für die Kreise
  
  // Ursprungspositionen berechnen
  for (let i = 0; i < maxObjects; i++) {
    let angle = map(i, 0, maxObjects, 0, TWO_PI) - HALF_PI;
    let xPos = width / 2 + cos(angle) * clockRadius;
    let yPos = height / 2 + sin(angle) * clockRadius;
    originalPositions.push({ x: xPos, y: yPos });
  }
}

function draw() {
  background(0);  // Schwarzer Hintergrund
  
  let currentElapsedTime = floor(millis() / 1000);
  let elapsedTimeChanged = false;
  if(currentElapsedTime > elapsedTime) {
    elapsedTime = currentElapsedTime;  // Berechnet die vergangene Zeit in Sekunden
    elapsedTimeChanged = true;
  }
  
  // Alle 1 Sekunde ein neues Objekt erstellen, bis maxObjects (60 Sekunden) erreicht sind
  let currentSecond = elapsedTime % maxObjects;  // Sekunde wird zwischen 0 und 59 begrenzt

  // Wenn wir uns in einer neuen Sekunde befinden und es noch keine Position für dieses Sekunde gibt
  if (objects[currentSecond] == undefined) {
    objects[currentSecond] = createObject(currentSecond);  // Füge das Objekt hinzu, basierend auf der Zeit
    fallSpeeds[currentSecond] = 0;  // Setze die Fallgeschwindigkeit für das neue Objekt
  }

  if(elapsedTimeChanged) {
    if(random(10) < 4) {
        let randomIndex = floor(currentSecond - random(15));
        if(currentSecond < 10) randomIndex = floor(random(currentSecond))
        if (!fallingCircles.includes(randomIndex)) {
          fallingCircles.push(randomIndex);
        }
    }
  }

  if (currentSecond === 0) {
    resetGame()
  }

  // // Wenn der 55. Kreis erreicht ist, sollen die Kreise grau werden und fallen
  // if (currentSecond === 55 && fallingCircles.length === 0) {
  //   console.log("55")
  //   // Wähle zufällig 30 Kreise aus, die grau werden und fallen sollen
  //   let selectedIndexes = [];
  //   while (selectedIndexes.length < 30) {
  //     let randomIndex = floor(random(currentSecond));
  //     if (!selectedIndexes.includes(randomIndex)) {
  //       selectedIndexes.push(randomIndex);
  //       fallingCircles.push(randomIndex); // Speichere die Indizes der fallenden Kreise
  //     }
  //   }
  // }

  // // Wenn der 60. Kreis erreicht ist, sollen alle restlichen Kreise auch grau werden und fallen
  // if (currentSecond === 59) {
  //   console.log("60")
  //   // Alle noch verbleibenden Kreise werden jetzt auch fallend und grau
  //   for (let i = 30; i < objects.length; i++) {
  //     if (!fallingCircles.includes(i)) {
  //       fallingCircles.push(i);
  //     }
  //   }
  // }

  // Zeichne alle Objekte, die existieren
  for (let i = 0; i <= currentSecond; i++) {
    if (objects[i]) {
      // Überprüfe, ob der aktuelle Kreis in der Liste der fallenden Kreise ist
      let isFallingCircle = fallingCircles.includes(i);
      drawObject(objects[i], i, isFallingCircle);
    }
  }
  
  // Zeige die analoge Uhr an
  drawAnalogClock();
}

// Erstelle Objekte entlang des Uhrkreises
function createObject(second) {
  let angle = map(second, 0, maxObjects, 0, TWO_PI) - HALF_PI;
  
  let xPos = width / 2 + cos(angle) * clockRadius;
  let yPos = height / 2 + sin(angle) * clockRadius;

  return {
    bigRadius: 100 * scaleFactor,   // Größere Radien
    middleRadius: 75 * scaleFactor,
    smallRadius: 50 * scaleFactor,
    tinyRadius: 25 * scaleFactor,
    lowerRadius: 40 * scaleFactor,
    xPos: xPos,
    yPos: yPos
  };
}

// Ziehe den Kreis der Maus nach, aber lasse ihn weiterhin fallen
function drawObject(obj, index, isFallingCircle) {
  let targetX = mouseX;
  let targetY = mouseY;

  // Wenn die Maustaste gedrückt wird, folge der Maus schneller
  let speed = mouseIsPressed ? 0.2 : 0.05;  // Schneller bei gedrückter Maustaste, langsamer ohne

  // Berechne den Abstand zwischen dem Kreis und der Maus
  let distance = dist(obj.xPos, obj.yPos, targetX, targetY);

  // Wenn der Kreis nicht am Ziel ist, bewege ihn in Richtung der Maus
  if (distance > 2) {
    let angle = atan2(targetY - obj.yPos, targetX - obj.xPos);
    obj.xPos += cos(angle) * speed;
    obj.yPos += sin(angle) * speed;
  }

  // Wenn der Kreis fällt, erhöhe die Fallgeschwindigkeit
  if (isFallingCircle) {
    fallSpeeds[index] += gravity;
    obj.yPos += fallSpeeds[index];
    obj.xPos += devAccX*1.5;

    // Wenn der Kreis den Boden erreicht, stoppe das Fallen
    if (obj.yPos >= height - obj.bigRadius) {
      obj.yPos = height - obj.bigRadius;
      fallSpeeds[index] = 0;  // Stoppe das Fallen
    }

    stroke(169, 169, 169);  // Grau für fallende Kreise
  } else {
    stroke(255);  // Weiße Farbe für nicht fallende Kreise
  }

  // Zeichne die Kreise
  strokeWeight(4);
  ellipse(obj.xPos, obj.yPos, obj.bigRadius * 2, obj.bigRadius * 2);  // Großer Kreis
  
  strokeWeight(3);
  ellipse(obj.xPos, obj.yPos, obj.middleRadius * 2, obj.middleRadius * 2);  // Mittlerer Kreis
  
  strokeWeight(2);
  ellipse(obj.xPos, obj.yPos, obj.smallRadius * 2, obj.smallRadius * 2);  // Innerer Kreis
  
  strokeWeight(2);
  ellipse(obj.xPos, obj.yPos, obj.tinyRadius * 2, obj.tinyRadius * 2);  // Kleinster Kreis
}

// Funktion zum Zeichnen der analogen Uhr
function drawAnalogClock() {
  let hr = hour();   // Holen der aktuellen Stunde
  let min = minute(); // Holen der aktuellen Minute
  let sec = second(); // Holen der aktuellen Sekunde
  
  let centerX = width / 2;
  let centerY = height / 2;
  
  // Setze die Strichfarbe auf Grau
  stroke(169, 169, 169);  // Standardfarbe für die Uhrstriche
  strokeWeight(4);
  
  // Zeichne die Stundenmarkierungen
  for (let i = 0; i < 12; i++) {
    let angle = map(i, 0, 12, 0, TWO_PI) - HALF_PI;
    let x1 = centerX + cos(angle) * (clockRadius - 20);
    let y1 = centerY + sin(angle) * (clockRadius - 20);
    let x2 = centerX + cos(angle) * clockRadius;
    let y2 = centerY + sin(angle) * clockRadius;
    line(x1, y1, x2, y2);
  }

  // Überprüfe, ob eine neue Minute begonnen hat, und setze die Farbe der Uhrstriche auf Weiß
  if (sec === 0) {
    stroke(255);  // Wenn eine neue Minute angefangen hat, setze die Farbe auf Weiß
  }

  let hourAngle = map(hr % 12, 0, 12, 0, TWO_PI) - HALF_PI;
  let minAngle = map(min, 0, 60, 0, TWO_PI) - HALF_PI;
  let secAngle = map(sec, 0, 60, 0, TWO_PI) - HALF_PI;

  // Zeichne die Stunden-, Minuten- und Sekundenzeiger
  strokeWeight(12);
  line(centerX, centerY, centerX + cos(hourAngle) * 200, centerY + sin(hourAngle) * 200);

  strokeWeight(10);
  stroke(255, 0, 0);
  line(centerX, centerY, centerX + cos(minAngle) * 250, centerY + sin(minAngle) * 250);
}

function resetGame() {
  objects = [];
  fallSpeeds = [];
  fallingCircles = [];

  // Setze alle Kreise zurück auf ihre ursprüngliche Position
  for (let i = 0; i < maxObjects; i++) {
    objects[i] = createObject(i);
    fallSpeeds[i] = 0;
  }
}

function deviceMoved() {
  console.log("accX:"+accelerationX)
  // When the device is moved, draw a circle with its position and size
  // based on the direction in which the device is moved.

  // Map acceleration along x axis to position along canvas width
  let x = map(accelerationX, -10, 10, 0, width);

  // Map acceleration along y axis to position along canvas height
  let y = map(accelerationY, -10, 10, 0, height);

  // Map acceleration along z axis to size between 10-100
  let diameter = map(accelerationZ, -10, 10, 10, 100);

  // Use alpha value to fade out previously drawn circles
  // background(0, 64);
  // noStroke();
  // circle(x, y, diameter);
  devAccX = accelerationX;
  devAccY = accelerationY;
  devAccZ = accelerationZ;
}
