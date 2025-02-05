const Engine = Matter.Engine;
const Runner = Matter.Runner;
const World = Matter.World;
const Events = Matter.Events;
const Bodies = Matter.Bodies;

// the Matter engine to animate the world
let engine, runner, world, mouse;
let isDrag = false;
// 4512 2538
const dim = { w: 960, h: 960 }
let off = { x: 0, y: 0 }
let blocks = [];
let murmel, canvasElem
const testBall = 'red'
let figureImg

// collisionFilter: {group: 0x00, category: 0b0000 0000 0000 0001, mask: 0b1111 1111 1111 1111}
// collision of A and B: group > 0 && groupA == groupB          ,
// no collision of A and B: group < 0 && groupA == groupB
// groupA != groupB: 
// collision of A and B ? (categoryA & maskB) !== 0 && (categoryB & maskA) !== 0
const cfM = { group: 0, category: 0x0002, mask: 0x0021 }
const cfX = { group: 0, category: 0x0004, mask: 0xFFFF }

const setCollide = (cfA, cfB, on) => {
  cfA.mask = on ? cfA.mask | cfB.category : cfA.mask & (~cfB.category & 0xFF)
  // console.log(cfA.mask.toString(2))
}
const doesCollide = (cfA, cfB) => {
  return (cfA.mask & cfB.category) !== 0 && (cfB.mask & cfA.category) !== 0
}

function preload() {
  figureImg = loadImage('figure.png')
}

function setup() {
  console.log(windowWidth, windowHeight);
  canvasElem = document.getElementById('thecanvas')
  let canvas = createCanvas(dim.w, dim.h);
  canvas.parent('thecanvas');

  engine = Engine.create();
  runner = Runner.create({ isFixed: true, delta: 1000 / 60 })
  world = engine.world;

  mouse = new Mouse(engine, canvas, { stroke: 'blue', strokeWeight: 3 });
  // Matter.Mouse.setScale(mouse.mouse, {x: 0.75, y: 0.75});

  // Oder auch Test-Murmeln in Spiel bringen
  mouse.on("startdrag", evt => {
    isDrag = true;
  });
  mouse.on("mouseup", evt => {
    if (!isDrag) {
      addMurmel({ x: evt.mouse.position.x, y: evt.mouse.position.y }, testBall, {})
    }
    isDrag = false;
  });

  // Hier wird registriert, ob die Murmel mit etwas kollidiert und
  // dann die trigger-Funktion des getroffenen Blocks ausgelöst
  // Dieser Code ist DON'T TOUCH IT - wenn das Bewdürfnis besteht, bitte mit Benno reden!!!
  Events.on(engine, 'collisionStart', function (event) {
    var pairs = event.pairs;
    pairs.forEach((pair, i) => {
      if (pair.bodyA.label == 'Murmel') {
        pair.bodyA.plugin.block.collideWith(pair.bodyB.plugin.block)
      }
      if (pair.bodyB.label == 'Murmel') {
        pair.bodyB.plugin.block.collideWith(pair.bodyA.plugin.block)
      }
    })
  })

  Events.on(engine, 'collisionActive', function (event) {
    var pairs = event.pairs;
    pairs.forEach((pair, i) => {
      if (pair.bodyA.label == 'Murmel' && pair.bodyB.label == 'Active') {
        pair.bodyA.plugin.block.collideWith(pair.bodyB.plugin.block)
      }
      if (pair.bodyB.label == 'Murmel' && pair.bodyA.label == 'Active') {
        pair.bodyB.plugin.block.collideWith(pair.bodyA.plugin.block)
      }
    })
  })

  createScene();
  // Den Motor von Matter starten: die Physik wird berechnet
  Runner.run(runner, engine);
  // engine.gravity.x = 1
  // engine.gravity.y = 0
}

function addMurmel(point, color, filter) {
  const ball = new Ball(
    world,
    { x: point.x, y: point.y, r: 30, color: color },
    {
      label: "Murmel", restitution: 0.9, friction: 0.0, frictionAir: 0.0, isStatic: false, density: 0.01,
      collisionFilter: filter
    }
  )
  blocks.push(ball)
  return ball
}

function createScene() {

  new BlocksFromSVG(world, 'clock.svg', [],
    { isStatic: true, restitution: 0.0, friction: 0.0, frictionAir: 0.0 },
    {
      save: false, sample: 40, offset: { x: -100, y: -100 }, done: (added, time, fromCache) => {
        console.log('FRAME', added, time, fromCache)
        // Object.keys(added).forEach(key => {
        //   added[key].attributes.trigger = (ball, block) => {
        //     if (ball.attributes.color == testBall) {
        //       Matter.Composite.remove(engine.world, ball.body)
        //       blocks = blocks.filter(block => block != ball)
        //     }
        //   }  
        // })
      }
    });

    const ball = new Ball(
      world,
      { x: 300, y: 100, r: 120, color: 'red', image: figureImg },
      {
        label: "Murmel", restitution: 0.5, friction: 0.2, frictionAir: 0.0, isStatic: false, density: 0.01
      }
    )
    offsetMassCentre(ball.body, { x: 0, y: 50 });
    blocks.push(ball)
}

function offsetMassCentre(body, offset) {
  body.position.x += offset.x;
  body.position.y += offset.y;
  body.positionPrev.x += offset.x;
  body.positionPrev.y += offset.y;
}


function draw() {
  clear();
  blocks.forEach(block => block.draw());
  mouse.draw();
}
