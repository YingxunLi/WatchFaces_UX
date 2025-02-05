function init() {
  const engine = Matter.Engine.create();
  const world = engine.world;

  const render = Matter.Render.create({
    element: document.body,
    engine: engine,
    options: {
      width: 600,
      height: 600,
      wireframes: true,
      showAngleIndicator: false,
      background: "#808080"
    }
  });
  Matter.World.add(world, Matter.Bodies.rectangle(300, 580, 600, 20, { isStatic: true }));
  Matter.World.add(world, Matter.Bodies.rectangle(200, 400, 20, 20, { isStatic: true }));
  const cart = bodyWithParts(200, 150, { isStatic: false });
  Matter.World.add(world, cart);

  const mouse = Matter.Mouse.create(render.canvas);
  const mouseConstraint = Matter.MouseConstraint.create(engine, {
    mouse: mouse,
    render: { visible: true }
  });
  Matter.World.add(world, mouseConstraint);
  render.mouse = mouse;

  Matter.Runner.run(engine);
  Matter.Render.run(render);
}

function bodyWithParts(x, y, options) {
  options = options || {}
  const w = 4;
  options.parts = [];
  options.parts.push(Matter.Bodies.rectangle(w, 20, 5, 20));
  options.parts.push(Matter.Bodies.rectangle(40 - w, 20, 5, 20));
  options.parts.push(Matter.Bodies.rectangle(20, 40 - w, 50, 5))
  const body = Matter.Body.create(options)
  Matter.Body.setPosition(body, { x: x, y: y });
  Matter.Body.setAngle(body, Math.PI / 3);
  return body;
}