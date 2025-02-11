const { Engine, Runner, Bodies, Composite, Constraint, Mouse, MouseConstraint } = Matter;

const canvasWidth = 960;
const canvasHeight = 960;

let engine, world, pendulum, constraint, mouseConstraint;
const baseBallRadius = 100;

function setup() {
    const canvas = createCanvas(canvasWidth, canvasHeight);

    engine = Engine.create();
    world = engine.world;

    pendulum = Bodies.circle(canvasWidth / 2, canvasHeight / 2 + 400, baseBallRadius, {
        restitution: 1,
        density: 3.0,
        frictionAir: 0.00,
        render: { fillStyle: 'transparent' },
    });

    let anchor = { x: canvasWidth / 2, y: 0 };
    constraint = Constraint.create({
        pointA: anchor,
        bodyB: pendulum,
        length: canvasHeight / 1.5,
        stiffness: 1,
        render: { strokeStyle: 'white', lineWidth: 3 },
    });

    Composite.add(world, [pendulum, constraint]);

    let mouse = Mouse.create(canvas.elt);
    mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: { stiffness: 0.2, render: { visible: false } },
    });
    Composite.add(world, mouseConstraint);

    Engine.run(engine);
}

function draw() {
    background(15);

    // 绘制摆锤
    noFill();
    stroke('#FFFFFF');
    strokeWeight(3);
    ellipse(pendulum.position.x, pendulum.position.y, baseBallRadius * 2);

    // 绘制约束线
    stroke('white');
    strokeWeight(3);
    line(constraint.pointA.x, constraint.pointA.y, pendulum.position.x, pendulum.position.y);
}