// Customizing
const backgroundColor = '#000000';
const secondsColorOn = '#fff';
const secondsColorOff = '#333';
const minutesColorHighlight = '#47E7FA';
const minutesColorNormal = '#fff';
const hoursColorOn = '#47E7FA';
const hoursColorOff = '#333';
const debugBorderColor = '#ff00ff';
const debugMinutesBorderOffColor = '#0095ff';

// Other Constants and Variables
const canvasSize = 1024;

let borders = [];
// Border Dimensions: [x, y, width, height]
const borderDimensions = [
	// Outer Bottom
	[canvasSize / 2, canvasSize - 60, 1000, 120],
	// Outer Top
	[canvasSize / 2, 60, 1000, 120],
	// Outer Left
	[60, canvasSize / 2, 120, 1000],
	// Outer Right
	[canvasSize - 60, canvasSize / 2, 120, 1000],
	// Inner Bottom
	[canvasSize / 2, canvasSize - 260, 560, 60],
	// Inner Top
	[canvasSize / 2, 260, 560, 60],
	// Inner Left
	[260, canvasSize / 2, 60, 560],
	// Inner Right
	[canvasSize - 260, canvasSize / 2, 60, 560],
	// Minutes Border Top
	[canvasSize / 2, canvasSize / 2 - 317, 60, 150],
	// Minutes Border Right
	[canvasSize / 2 + 317, canvasSize / 2, 150, 60],
	// Minutes Border Bottom
	[canvasSize / 2, canvasSize / 2 + 317, 60, 150],
	// Minutes Border Left
	[canvasSize / 2 - 317, canvasSize / 2, 150, 60],
]

// Circles / Balls
let secondsCircles = [];
let minutesCircles = [];
let hoursCircles = [];

// Gravity
let previousGravity = { x: 0, y: 0 };

// Collision Categories
const collisionBorders = 0x0002;
const collisionMinutes = 0x0004;
const collisionHours = 0x0008;

// Debug Stuff
let debug = false;

// Time / Timing
function timerFunction() {
    const now = new Date();
    const hours = now.getHours() % 12 || 12; // Convert 24-hour format to 12-hour format
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    updateSeconds(seconds);
    updateMinutes(minutes);
    updateHours(hours);
}

// Start real-time updates
setInterval(timerFunction, 1000);

// let startSeconds = 35;
// let startMinutes = 40;
// let startHours = 7;
// const timeScale = 0.1; // 1 = 1 second, 0.5 = double speed, 2 = half speed

// Setup Canvas
const { Engine, Render, Runner, World, Bodies, Mouse, MouseConstraint } = Matter;
const canvas = document.getElementById('matterCanvas');
const engine = Matter.Engine.create();
const render = Matter.Render.create({
	canvas: canvas,
	engine: engine,
	options: {
		width: canvasSize,
		height: canvasSize,
		background: backgroundColor,
		wireframes: false,
	}
});
Matter.Render.run(render);
Matter.Runner.run(engine);

// Setup all borders
function setupBorders() {
	for (let i = 0; i < borderDimensions.length; i++) {
		let [x, y, width, height] = borderDimensions[i];
		let border = Matter.Bodies.rectangle(x, y, width, height, {
			isStatic: true,
			render: { fillStyle: debugBorderColor, visible: false, opacity: 0.3 },
		});
		border.collisionFilter.category = collisionBorders;
		borders.push(border);
		Matter.World.add(engine.world, border);
	}
}

// Setup the seconds around the canvas
function setupSeconds() {
	// Add static circles around the square
	const squareSize = canvasSize - 120; // Inner square size (centered within the canvas + some padding)
	const padding = (canvasSize - squareSize) / 2; // Padding from the canvas edges
	const numberOfCircles = 60;
	const circlesPerSide = Math.floor(numberOfCircles / 4 + 1); // Circles per square edge

	// Place circles along the top edge
	for (let i = 0; i < circlesPerSide - 1; i++) {
		const x = padding + (i * squareSize) / (circlesPerSide - 1);
		const y = padding;
		const circle = Matter.Bodies.circle(x, y, 10, {
			isStatic: true,
			render: { fillStyle: '#fff' },
		});
		circle.collisionFilter.mask = 0;
		secondsCircles.push(circle);
	}

	// Place circles along the right edge
	for (let i = 0; i < circlesPerSide - 1; i++) {
		const x = canvasSize - padding;
		const y = padding + (i * squareSize) / (circlesPerSide - 1);
		const circle = Matter.Bodies.circle(x, y, 10, {
			isStatic: true,
			render: { fillStyle: '#fff' },
		});
		circle.collisionFilter.mask = 0;
		secondsCircles.push(circle);
	}

	// Place circles along the bottom edge
	for (let i = 0; i < circlesPerSide - 1; i++) {
		const x = canvasSize - padding - (i * squareSize) / (circlesPerSide - 1);
		const y = canvasSize - padding;
		const circle = Matter.Bodies.circle(x, y, 10, {
			isStatic: true,
			render: { fillStyle: '#fff' },
		});
		circle.collisionFilter.mask = 0;
		secondsCircles.push(circle);
	}

	// Place circles along the left edge
	for (let i = 0; i < circlesPerSide - 1; i++) {
		const x = padding;
		const y = canvasSize - padding - (i * squareSize) / (circlesPerSide - 1);
		const circle = Matter.Bodies.circle(x, y, 10, {
			isStatic: true,
			render: { fillStyle: '#fff' },
		});
		circle.collisionFilter.mask = 0;
		secondsCircles.push(circle);
	}

	// Add the circles to the Matter.js world
	Matter.World.add(engine.world, secondsCircles);
}

// Update the seconds according to the current time and change the color of the circles
function updateSeconds(seconds) {
	if (seconds == 0) {
		secondsCircles.forEach(circle => {
			circle.render.fillStyle = secondsColorOn;
		});
	} else {
		const visible_circles = secondsCircles.slice(0, seconds);
		const hidden_circles = secondsCircles.slice(seconds);
		visible_circles.forEach(circle => {
			// circle.render.visible = true;
			circle.render.fillStyle = secondsColorOn;
		});

		hidden_circles.forEach(circle => {
			// circle.render.visible = false;
			circle.render.fillStyle = secondsColorOff;
		});
	}
}

// // Timer Function to update the time. Note: This is currently not synced with the actual time but manually incremented according to the start time defined above
// function timerFunction() {
// 	startSeconds++;
// 	if (startSeconds > 60) {
// 		startSeconds = 0;
// 		startMinutes++;
// 		if (startMinutes == 60) {
// 			startMinutes = 0;
// 			startHours++;
// 			if (startHours > 12) {
// 				startHours = 1;
// 			}
// 		}
// 	}
// 	updateSeconds(startSeconds);
// 	updateMinutes(startMinutes);
// 	updateHours(startHours);

// 	if(debug){
// 		console.log(startHours + ":" + startMinutes + ":" + startSeconds + " | " + minutesCircles.length);
// 	}
// }

// Update the minutes according to the current time
function updateMinutes(minutes) {
	while (minutesCircles.length < minutes) {
		let circle;
		let minute_circle_final_color;
		let minute_circle_final_style;
		if (minutesCircles.length % 5 == 4) {
			minute_circle_final_color = minutesColorHighlight;
			minute_circle_final_style = { fillStyle: '#47E7FA'}; 
			// Customizing with stroke: minute_circle_final_style = { fillStyle: '#47e359', strokeStyle: '#fff', lineWidth: 12 };
		} else {
			minute_circle_final_color = minutesColorNormal;
			minute_circle_final_style = { fillStyle: minutesColorNormal};
		}
		circle = Matter.Bodies.circle(canvasSize / 2 + 80, 180, 34, {
			isStatic: false,
			render: minute_circle_final_style,
			mass: 1,
			restitution: 1,
			friction: 0.1,
		});
		circle.collisionFilter.category = collisionMinutes;
		circle.collisionFilter.mask = collisionBorders | collisionMinutes;
		const forceMagnitude = 0.04 * circle.mass;
		Matter.Body.applyForce(circle, circle.position, {
			x: forceMagnitude * 1,
			y: 0
		});
		minutesCircles.push(circle);
		Matter.World.add(engine.world, circle);
	}
	disableMinutesBorders(minutes);
	removeMinutesOutOfBound();
}

// Setup the hours
function setupHours(){
	for (let i = 0; i < 12; i++) {
		const circle = Matter.Bodies.circle(canvasSize / 2 + Math.random(20), canvasSize / 2 + Math.random(20), 60, {
			isStatic: false,
			render: { fillStyle: hoursColorOff, lineWidth: 0 },
			mass: 1,
			restitution: 1,
			friction: 1,
			gravityScale: 0.1
		});
		circle.collisionFilter.category = collisionHours;
		circle.collisionFilter.mask = collisionBorders | collisionHours;
		hoursCircles.push(circle);
		Matter.World.add(engine.world, circle);
	}
}

// Update the hours according to the current time
function updateHours(hours) {
	for(let i = 0; i < hoursCircles.length; i++){
		if(i < hours){
			hoursCircles[i].render.fillStyle = hoursColorOn;
		} else {
			hoursCircles[i].render.fillStyle = secondsColorOff;
		}
	}
}


// Toggle the gravity of the Matter.js engine between 0 (off) and the previous value
function toggleGravity() {
	if (engine.world.gravity.x === 0 && engine.world.gravity.y === 0) {
		setGravity(previousGravity.x, previousGravity.y);
	} else {
		previousGravity.x = engine.world.gravity.x;
		previousGravity.y = engine.world.gravity.y;
		setGravity(0, 0);
	}
}

// Set the gravity of the Matter.js engine to a specific value
function setGravity(x, y) {
	engine.world.gravity.x = x;
	engine.world.gravity.y = y;
	if(debug){
		console.log("Gravity set to: x: " + x + " y: " + y);
	}
}

// Toggle the debug mode
function toggleDebug() {
	debug = !debug;
	if (debug) {
		borders.forEach(border => {
			border.render.visible = true;
		});
	} else {
		borders.forEach(border => {
			border.render.visible = false;
		});
	}
}

// Disable the borders for the minutes according to the current time
function disableMinutesBorders(minutes) {
	// Disable the borders for the minutes according to the current time
	if (minutes > 15){
		borders[9].collisionFilter.mask = 0;
		borders[9].render.fillStyle = debugMinutesBorderOffColor;
	}
	if (minutes > 30){
		borders[10].collisionFilter.mask = 0;
		borders[10].render.fillStyle = debugMinutesBorderOffColor;
	}
	if (minutes > 45){
		borders[11].collisionFilter.mask = 0;
		borders[11].render.fillStyle = debugMinutesBorderOffColor
	}
	if (minutes == 1){
		borders[9].collisionFilter.mask = collisionMinutes;
		borders[9].render.fillStyle = debugBorderColor;
		borders[10].collisionFilter.mask = collisionMinutes;
		borders[10].render.fillStyle = debugBorderColor;
		borders[11].collisionFilter.mask = collisionMinutes;
		borders[11].render.fillStyle = debugBorderColor;
	}
	if (minutes == 0){
		// Remove the seconds and hours and readd them to draw them on top of the minutes
		hoursCircles.forEach(circle => {
			Matter.World.remove(engine.world, circle);
			Matter.World.add(engine.world, circle);
		});
		secondsCircles.forEach(circle => {
			Matter.World.remove(engine.world, circle);
			Matter.World.add(engine.world, circle);
		});
		// Apply a small force to all minutes to make them move and disable the collision with the borders
		minutesCircles.forEach(circle => {
			randomdir = Math.random() < 0.5 ? -1 : 1;
			circle.collisionFilter.mask = collisionMinutes;
			Matter.Body.applyForce(circle, circle.position, {
				x: randomdir * 0.1,
				y: randomdir * 0.1
			});
		});
	}
}

// Add a small force to all circles to make them move
function shakeCircles() {
	const forceMagnitude = 0.04;
	[...secondsCircles, ...minutesCircles, ...hoursCircles].forEach(circle => {
		let gravityX = Math.random() < 0.5 ? -1 : 1;
		let gravityY = Math.random() < 0.5 ? -1 : 1;
		Matter.Body.applyForce(circle, circle.position, {
			x: -gravityX * forceMagnitude,
			y: -gravityY * forceMagnitude
		});
	});
}

// Keyboard Controls
document.addEventListener('keydown', function(event) {
	switch(event.key) {
		case 'w':
			setGravity(0, -1);
			break;
		case 's':
			setGravity(0, 1);
			break;
		case 'a':
			setGravity(-1, 0);
			break;
		case 'd':
			setGravity(1, 0);
			break;
		case 'e':
			shakeCircles();
			break;
		case 'q':
			toggleGravity();
			break;
		case 't':
			toggleDebug();
			break;
		case 'r':
			location.reload();
			break;
		default:
			break;
	}
});

// Remove minutes that are out of bounds to clear the minutes array after the minutes are not needed anymore
function removeMinutesOutOfBound(){
	minutesCircles.forEach(circle => {
		if(circle.position.x < -10 || circle.position.x > canvasSize + 10 || circle.position.y < -10|| circle.position.y > canvasSize + 10){
			Matter.World.remove(engine.world, circle);
			minutesCircles.pop(circle);
		}
	});
}

setupBorders();
setupSeconds();
setupHours();
// setInterval(timerFunction, 1000);