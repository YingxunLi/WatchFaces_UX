// --- Import Matter.js ---
// Importiert die notwendigen Funktionen aus der Matter.js Physikbibliothek
const { Engine, World, Bodies, Body, Vector } = Matter;

let engine; // Die Physikengine
let world; // Die Physikwelt (alle Objekte existieren hier)
let hours = []; // Array für die Stundenmarkierungen (Kreise)
let minutes = []; // Array für die Minutenmarkierungen (Kreise)
let seconds = []; // Array für die Sekundenmarkierungen (Kreise)
let center; // Der Mittelpunkt der Uhr (Kreis)
const radiusHours = 150; // Der Radius des Stundenkreises (150px)
const radiusMinutes = 300; // Der Radius des Minutenkreises (250px)
const radiusSeconds = 350; // Der Radius des Sekundenkreises (350px)
const numHours = 12; // Anzahl der Stundenmarkierungen (12 Stunden)
const numMinutes = 60; // Anzahl der Minutenmarkierungen (59 Minuten)
const numSeconds = 60; // Anzahl der Sekundenmarkierungen (59 Sekunden)
let centerX, centerY; // Die Koordinaten des Mittelpunktes (Zentrum der Uhr)
let firstFallDone = false; // Flag, um zu kontrollieren, ob die erste Markierung gefallen ist
let currentSecondAtStart = 0; // Die aktuelle Sekunde zum Startzeitpunkt
let isTimeScaling = false; // Variable zum Verfolgen des Zeitskalierungseffekts
// let wrapAround = false; // Flag to track if wrap-around and reverse time is active
// let reverseDuration = 1000; // Duration for reverse time in milliseconds (2 seconds)
// let reverseStartTime = null; // The time when the reverse effect started
// let isReversing = false; // Flag to track if the objects are in reverse mode


// Bildschirmdimensionen für die unsichtbare Grenze
const screenWidth = 960; // Breite des Bildschirms (960px)
const screenHeight = 960; // Höhe des Bildschirms (960px)
const boundaryThickness = 100; // Dicke der unsichtbaren Bildschirmgrenze (100px)

// Variablen für den Touch-Feedback-Kreis (Interaktion)
let touchCircle = null; // Der Feedback-Kreis, der auf Berührung angezeigt wird
let touchCircleTimer = 0; // Timer, um den Feedback-Kreis zu verblassen

function setup() {
  // Setup-Funktion, die einmal beim Start ausgeführt wird
  createCanvas(screenWidth, screenHeight); // Erstellen der Zeichenfläche mit der angegebenen Größe
  centerX = width / 2; // Setzen des Mittelpunktes der Uhr auf die Bildschirmmitte
  centerY = height / 2; // Setzen des Mittelpunktes der Uhr auf die Bildschirmmitte

  engine = Engine.create(); // Erstellen einer neuen Physikengine
  world = engine.world; // Zugriff auf die Welt, die die Objekte enthält

  engine.world.gravity.y = 1; // Setzt die Schwerkraft in der Vertikalen (1px pro Frame)

  // Erstellen des Mittelpunkt-Kreises (ist statisch, aber unsichtbar und grau)
  center = Bodies.circle(centerX, centerY, 40, {
    isStatic: true, // Der Mittelpunkt ist statisch, bewegt sich also nicht
    render: { fillStyle: 'white' }, // Der Mittelpunkt ist grau
  });
  World.add(world, center); // Den Mittelpunkt der Welt hinzufügen

  // Erstellen der 12 Stundenmarkierungen (Kreise) um den Mittelpunkt
  for (let i = 0; i < numHours; i++) {
    const angle = (TWO_PI / numHours) * i - HALF_PI; // Berechnet den Winkel für jede Stundenmarkierung
    const x = centerX + radiusHours * cos(angle); // Berechnet die X-Position der Markierung
    const y = centerY + radiusHours * sin(angle); // Berechnet die Y-Position der Markierung

    // Erstellen eines Kreises für jede Stundenmarkierung
    const circle = Bodies.circle(x, y, 30, {
      restitution: 0.9, // Die Bouncy-Eigenschaft, wie stark es abprallt
      frictionAir: 0.7, // Der Luftwiderstand, wie schnell der Kreis stoppt
      isStatic: true, // Diese Markierungen sind statisch und bewegen sich nicht
    });
    hours.push({ body: circle, fallen: false, placeholder: { x, y, r: 30 } });

    World.add(world, circle); // Der Welt die Stundenmarkierung hinzufügen
    //hours.push({ body: circle, placeholder: { x, y, r: 30 } }); // Die Markierung und ihre Platzhalterposition speichern
  }

  // Erstellen der 59 Minutenmarkierungen (Kreise) um den Mittelpunkt
  for (let i = 0; i < numMinutes; i++) {
    const angle = (TWO_PI / numMinutes) * i - 7 * PI / 15 - PI / 30; // Berechnet den Winkel für jede Minutenmarkierung
    const x = centerX + radiusMinutes * cos(angle); // Berechnet die X-Position der Markierung
    const y = centerY + radiusMinutes * sin(angle); // Berechnet die Y-Position der Markierung

    // Erstellen eines Kreises für jede Minutenmarkierung
    const circle = Bodies.circle(x, y, 12, {
      restitution: 0.9, // Die Bouncy-Eigenschaft für Minutenmarkierungen
      frictionAir: 0.5, // Luftwiderstand für Minutenmarkierungen
      isStatic: true, // Minutenmarkierungen sind statisch
    });

    World.add(world, circle); // Der Welt die Minutenmarkierung hinzufügen
    minutes.push({ body: circle, fallen: false, placeholder: { x, y, r: 12 } }); // Minutenmarkierung speichern
  }

  // Erstellen der 59 Sekundenmarkierungen (Kreise) um den Mittelpunkt
  for (let i = 0; i < numSeconds; i++) {
    const angle = (TWO_PI / numSeconds) * i - PI / 2; // Berechnet den Winkel für jede Sekundenmarkierung
    const x = centerX + radiusSeconds * cos(angle); // Berechnet die X-Position der Markierung
    const y = centerY + radiusSeconds * sin(angle); // Berechnet die Y-Position der Markierung

    // Erstellen eines Kreises für jede Sekundenmarkierung
    const circle = Bodies.circle(x, y, 8, {
      restitution: 0.9, // Bouncy-Eigenschaft für Sekundenmarkierungen
      frictionAir: 0.01, // Luftwiderstand für Sekundenmarkierungen
      isStatic: true, // Sekundenmarkierungen sind statisch
    });

    World.add(world, circle); // Der Welt die Sekundenmarkierung hinzufügen
    seconds.push({ body: circle, fallen: false, placeholder: { x, y, r: 8 } }); // Sekundenmarkierung speichern
  }

  currentSecondAtStart = second(); // Speichern der aktuellen Sekunde zu Beginn

  const boundaryOptions = {
    isStatic: true, // Diese Begrenzungen bewegen sich nicht
    render: { visible: false }, // Unsichtbare Grenzen, sie sind nur für die Kollisionserkennung da
  };

  // Erstellen der unsichtbaren Bildschirmgrenzen (links, rechts, oben, unten)
  const leftBoundary = Bodies.rectangle(0, screenHeight / 2, boundaryThickness, screenHeight, boundaryOptions);
  const rightBoundary = Bodies.rectangle(screenWidth, screenHeight / 2, boundaryThickness, screenHeight, boundaryOptions);
  const topBoundary = Bodies.rectangle(screenWidth / 2, 0, screenWidth, boundaryThickness, boundaryOptions);
  const bottomBoundary = Bodies.rectangle(screenWidth / 2, screenHeight, screenWidth, boundaryThickness, boundaryOptions);

  World.add(world, [leftBoundary, rightBoundary, topBoundary, bottomBoundary]); // Füge die Begrenzungen zur Welt hinzu
}

let lastSecond = 0;
let resetSeconds = false;
let lastMinute = 0;
let resetMinutes = false;

let pulseTime = 0; // Zeit für das Pulsieren des Kreises


function draw() {
  // Funktion, die jede Sekunde neu aufgerufen wird, um den Bildschirm zu zeichnen
  background(0, 25); // Hintergrund in Schwarz mit leichter Transparenz


  // Schwerkraft basierend auf der Neigung des Geräts (falls vorhanden)
  engine.gravity.x = (rotationY / 2 - engine.gravity.x) * 0.5;
  engine.gravity.y = (rotationX / 2 - engine.gravity.y) * 0.5;


  // // Check if the reverse effect is still active
  // if (isReversing) {
  //   // If the reverse duration has passed, stop reversing
  //   if (millis() - reverseStartTime >= reverseDuration) {
  //     isReversing = false; // Stop reversing after the duration
  //   } else {
  //     // Reverse the velocity of the balls
  //     reverseObjectsVelocity(hours);
  //     reverseObjectsVelocity(minutes);
  //     reverseObjectsVelocity(seconds);
  //   }
  // }

  // // If wrapAround flag is set, apply wrap-around to all balls
  // if (wrapAround) {
  //   wrapObjects(hours);
  //   wrapObjects(minutes);
  //   wrapObjects(seconds);
  // }

  //   // Wenn timeScaling aktiviert ist, skalieren wir die Zeit (verlangsamen oder beschleunigen die Physik)
  // if (isTimeScaling) {
  //   Engine.update(engine, -100); // Verlangsamt die Physik, indem wir eine reduzierte Zeitrate angeben (16.66ms ≈ 60 FPS)
  // } else {
  //   Engine.update(engine); // Standard-Physikaktualisierung
  // }

  Engine.update(engine); // Die Physik-Engine wird aktualisiert

  // Berechne die aktuelle Sekunde
  const currentSecond = second();

  // Berechne die aktuelle Minute
  const currentMinute = minute();

  


  
  // Überprüfen, ob eine neue Minute begonnen hat (wenn currentSecond 0 ist und lastSecond 59 war)
  if (currentSecond === 0 && lastSecond === 59) {
    resetSeconds = true; // Setze das Flag, um die Sekundenmarkierungen zurückzusetzen
  }
    
  // Wenn wir in eine neue Minute gehen, setze den Sekundenring zurück
  if (resetSeconds) {
    resetSeconds = false; // Rücksetzen des Flags
    resetSecondMarks(); // Rufe eine Funktion auf, um die Sekundenmarkierungen zurückzusetzen
  }
  
  lastSecond = currentSecond; // Speichere die aktuelle Sekunde für die nächste Überprüfung

  // Überprüfen, ob eine neue Minute begonnen hat (wenn currentMinute 0 ist und lastMinute 59 war)
  if (currentMinute === 0 && lastMinute === 59) {
    resetMinutes = true; // Setze das Flag, um die Minutenmarkierungen zurückzusetzen
  }
  
  // Wenn wir in eine neue Minute gehen, setze den Minutenring zurück
  if (resetMinutes) {
    resetMinutes = false; // Rücksetzen des Flags
    resetMinuteMarks(); // Rufe eine Funktion auf, um die Minutenmarkierungen zurückzusetzen
  }

  lastMinute = currentMinute; // Speichere die aktuelle Minute für die nächste Überprüfung
  
  // Berechne das Pulsieren (von 0 bis 1)
  let scaleFactor = sin(pulseTime) * 0.5 + 1; // Sinusfunktion für pulsierende Skalierung
  pulseTime += 0.02; // Inkrementiere die Zeit für das Pulsieren


  fill(50, 50, 50); // Eine graue Farbe für den Mittelpunkt
  noStroke();
  circle(center.position.x, center.position.y, 80 * scaleFactor); // Kreis mit doppeltem Radius, weil p5.js `diameter` nutzt


  // Platzhalter für die Stundenmarkierungen zeichnen
  for (let i = 0; i < hours.length; i++) {
    const { x, y, r } = hours[i].placeholder;
    fill(50, 50, 50, 50); // Graue Farbe mit Transparenz
    noStroke(); // Kein Rand
    circle(x, y, r); // Zeichne den Platzhalterkreis
  }

  // Platzhalter für die Minutenmarkierungen zeichnen
  for (let i = 0; i < minutes.length; i++) {
    const { x, y, r } = minutes[i].placeholder;
    fill(50, 50, 50, 50); // Graue Farbe mit Transparenz
    noStroke(); // Kein Rand
    circle(x, y, r); // Zeichne den Platzhalterkreis
  }

  // Platzhalter für die Sekundenmarkierungen zeichnen
  for (let i = 0; i < seconds.length; i++) {
    const { x, y, r } = seconds[i].placeholder;
    fill(50, 50, 50, 50); // Graue Farbe mit Transparenz
    noStroke(); // Kein Rand
    circle(x, y, r); // Zeichne den Platzhalterkreis
  }

  // Stundenmarkierungen zeichnen
  for (let i = 0; i < hours.length; i++) {
    if (i <= hour() && !hours[i].fallen) {
      Body.setStatic(hours[i].body, false); // Markierung beweglich machen
      hours[i].fallen = true; // Als gefallen markieren
    }
    
    fill(hours[i].fallen ? '#FF0000' : 50); // Rot für aktive Stunden
    noStroke();

    circle(hours[i].body.position.x, hours[i].body.position.y, 60);
  }

  

  // Minutenmarkierungen zeichnen
  for (let i = 0; i < minutes.length; i++) {
    // Wenn die Minute aktiv ist, lasse die Markierung fallen
    if (i <= minute() && !minutes[i].fallen) {
      Body.setStatic(minutes[i].body, false); // Mache die Markierung beweglich
      minutes[i].fallen = true; // Setze das Flag, dass die Markierung gefallen ist
    }
    if (i <= currentMinute) {
      Body.setStatic(minutes[i].body, false); // Mache die Minutenmarkierung beweglich
      minutes[i].fallen = true; // Markiere die Minutenmarkierung als gefallen
      fill(i % 5 === 0 ? '#FF0000' : 255); // Rote Farbe für jede fünfte Minute, sonst Weiße Farbe
    }

    fill(minutes[i].fallen ? (i % 5 === 0 && i !== 0 ? '#FF0000' : 255) : '#333333'); // Rot für jede fünfte Minute, sonst Weiß
    noStroke(); // Kein Rand
    circle(minutes[i].body.position.x, minutes[i].body.position.y, 24); // Zeichne die Minutenmarkierung
  }

  // Sekundenmarkierungen zeichnen
  for (let i = 0; i < seconds.length; i++) {
    if (i <= second()) {
      Body.setStatic(seconds[i].body, false); // Mache die Sekundenmarkierung beweglich
      seconds[i].fallen = true; // Markiere die Sekundenmarkierung als gefallen
      fill('#FFFFFF'); // Weiß für alle aktiven Sekundenmarkierungen
    }

    noStroke(); // Kein Rand
    circle(seconds[i].body.position.x, seconds[i].body.position.y, 16); // Zeichne die Sekundenmarkierung
  }

  // Touch-Feedback für Benutzerinteraktion
  if (touchCircle !== null) {
    fill(255, 0, 0, touchCircle.alpha); // Rot mit zunehmender Transparenz
    noStroke(); // Kein Rand
    circle(touchCircle.x, touchCircle.y, touchCircle.size); // Zeichne den Feedback-Kreis

    touchCircle.alpha -= 5; // Verringere die Transparenz
    if (touchCircle.alpha <= 0) {
      touchCircle = null; // Wenn der Kreis transparent genug ist, setze ihn auf null
    }
  }
}

// Funktion, die beim Start eines Touch-Ereignisses aufgerufen wird
function touchStarted() {
  // isTimeScaling = !isTimeScaling;
  // // Toggle the wrap-around effect
  // wrapAround = !wrapAround; // Flip the wrap-around flag on each touch

  // // Start the reverse effect and record the time when it started
  // if (!isReversing) {
  //   reverseStartTime = millis(); // Record the time at which reverse started
  //   isReversing = true;
  // }

  touchCircle = {
    x: mouseX, // Setze die X-Position des Touch-Kreises
    y: mouseY, // Setze die Y-Position des Touch-Kreises
    size: 30, // Setze die Größe des Feedback-Kreises
    alpha: 255, // Setze die maximale Transparenz
  };

  touchCircleTimer = millis(); // Starte den Timer für das Touch-Feedback
}

function resetSecondMarks() {
  // Gehe durch alle Sekundenmarkierungen und setze sie zurück
  for (let i = 0; i < seconds.length; i++) {
    Body.setStatic(seconds[i].body, true); // Setze die Markierungen wieder auf statisch
    seconds[i].fallen = false; // Markiere die Markierungen als "nicht gefallen"
    
    // Setze die Positionen der Markierungen auf ihre ursprünglichen Positionen zurück
    const angle = (TWO_PI / numSeconds) * i - PI / 2;
    const x = centerX + radiusSeconds * cos(angle);
    const y = centerY + radiusSeconds * sin(angle);

    // Setze die Position des Körpers auf die berechneten Positionen
    Body.setPosition(seconds[i].body, { x, y });
  }
}

// Funktion zum Zurücksetzen der Minutenmarkierungen
function resetMinuteMarks() {
  // Gehe durch alle Minutenmarkierungen und setze sie zurück
  for (let i = 0; i < minutes.length; i++) {
    Body.setStatic(minutes[i].body, true); // Setze die Markierungen wieder auf statisch
    minutes[i].fallen = false; // Markiere die Markierungen als "nicht gefallen"
    
    // Setze die Positionen der Markierungen auf ihre ursprünglichen Positionen zurück
    const angle = (TWO_PI / numMinutes) * i - PI / 2; // Berechne die Winkel für jede Minutenmarkierung
    const x = centerX + radiusMinutes * cos(angle); // Berechne die X-Position
    const y = centerY + radiusMinutes * sin(angle); // Berechne die Y-Position

    // Setze die Position des Körpers auf die berechneten Positionen zurück
    Body.setPosition(minutes[i].body, { x, y });
  }
}

// function wrapObjects(objects) {
//   objects.forEach(obj => {
//     // Check if the object is off-screen on the X-axis and wrap it
//     if (obj.body.position.x > screenWidth) {
//       Body.setPosition(obj.body, { x: 0, y: obj.body.position.y });
//     } else if (obj.body.position.x < 0) {
//       Body.setPosition(obj.body, { x: screenWidth, y: obj.body.position.y });
//     }

//     // Check if the object is off-screen on the Y-axis and wrap it
//     if (obj.body.position.y > screenHeight) {
//       Body.setPosition(obj.body, { x: obj.body.position.x, y: 0 });
//     } else if (obj.body.position.y < 0) {
//       Body.setPosition(obj.body, { x: obj.body.position.x, y: screenHeight });
//     }
//   });
// }

// function reverseObjectsVelocity(objects) {
//   objects.forEach(obj => {
//     // Reverse the velocity of each object
//     Body.setVelocity(obj.body, { x: -obj.body.velocity.x, y: -obj.body.velocity.y });
//   });
// }

// Funktion, die beim Ende eines Touch-Ereignisses aufgerufen wird
function touchEnded() {}
