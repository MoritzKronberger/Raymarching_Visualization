let camX, camY, rO, rD, circle;
let maxSteps = 100;
let maxDist = 1000;
let epsilon = 0.01;
let angle = 0;

let contactPoints = [];
let roDragged = false;
let showRay = true;

let c;
let windowHeightOld;
let windowWidthOld;

// adjust canvas for changing window sizes
function windowResize() {
  deviceHeight = 0.6 * window.innerHeight;
  deviceWidth = 0.7 * window.innerWidth;
  if (deviceWidth > deviceHeight) {
    c = resizeCanvas(1.7 * deviceHeight, deviceHeight);
  } else {
    c = resizeCanvas(deviceWidth, 0.7 * deviceWidth);
  }

  rO = createVector(width / 3, height / 2);
  circle.pos = createVector((2 * width) / 3, height / 2);
  circle.radius = height * 0.1;
  contactPoints = [];

  windowHeightOld = window.innerHeight;
  windowWidthOld = window.innerWidth;
}

function setup() {
  deviceHeight = 0.6 * window.innerHeight;
  deviceWidth = 0.7 * window.innerWidth;
  if (deviceWidth > deviceHeight) {
    c = createCanvas(1.7 * deviceHeight, deviceHeight);
  } else {
    c = createCanvas(deviceWidth, 0.7 * deviceWidth);
  }

  windowHeightOld = window.innerHeight;
  windowWidthOld = window.innerWidth;

  // camera position
  rO = createVector(width / 3, height / 2);

  // ray direction
  rD = p5.Vector.fromAngle(angle);
  rD = rD.normalize();

  // circle
  circle = {
    pos: createVector((2 * width) / 3, height / 2),
    radius: height * 0.1,
  };

  // set parameters in html
  document.getElementById("maxSteps").value = maxSteps;
  document.getElementById("epsilon").value = epsilon;
  document.getElementById("showRay").checked = showRay;
}

function rayMarch() {
  // set initial distance
  let dO = 0;
  let dS = maxDist;
  // marching algorithm
  for (let i = 0; i < maxSteps; i++) {
    // current point position
    let p = rO.copy().add(rD.copy().mult(dO));
    noStroke();
    fill(155);
    i != 0 ? ellipse(p.x, p.y, 3) : "";

    // get min distance from scene objects
    dS = getDist(p);
    noFill();
    stroke(155);
    ellipse(p.x, p.y, dS);

    // add "safe Distance" to current point position
    dO += dS;

    // test if collision or no expected future collisions
    if (dO > maxDist || dS < epsilon) {
      return createVector(dS, dO);
    }
    document.getElementById("raySteps").innerHTML = `Schritte: ${i + 1}`;
  }
  return createVector(dS, dO);
}

// check if draggable objects are in dragging distance from mouse
function getDist(p) {
  return p.dist(circle.pos) - circle.radius;
}

function originDraggable() {
  return dist(rO.x, rO.y, mouseX, mouseY) < width / 50;
}

function circleDraggable() {
  return dist(circle.pos.x, circle.pos.y, mouseX, mouseY) < circle.radius / 2;
}

function rayDraggable() {
  return (
    dist(pointOnLineMouse.x, pointOnLineMouse.y, mouseX, mouseY) < width / 40
  );
}

function draw() {
  // check for changed window size
  if (window.innerWidth  != windowWidthOld &&
      window.innerHeight != windowHeightOld) {
    windowResize();
  }
  background(255);

  ellipseMode(RADIUS);

  // update parameters from html
  maxSteps = document.getElementById("maxSteps").value;
  epsilon = document.getElementById("epsilon").value;
  showRay = document.getElementById("showRay").checked;

  // highlight draggable origin
  if (originDraggable()) {
    noStroke();
    fill(195);
    ellipse(rO.x, rO.y, 15);
  }

  // draw camera
  noStroke();
  fill(100);
  ellipse(rO.x, rO.y, 5);

  // get closest point to mouse on ray for dragging distance
  let l = width * 2;
  let lineStart = createVector(rO.x, rO.y);
  let lineEnd = createVector(l * rD.x + rO.x, l * rD.y + rO.y);
  let mouseVector = createVector(mouseX, mouseY);
  pointOnLineMouse = orthogonalProjection(lineStart, lineEnd, mouseVector);

  // draw ray diection
  rayColor = createVector(64, 230, 229);
  rayDraggable()
    ? stroke(rayColor.x / 2, rayColor.y / 2, rayColor.z / 2)
    : stroke(rayColor.x, rayColor.y, rayColor.z);
  if (showRay) {
    line(lineStart.x, lineStart.y, lineEnd.x, lineEnd.y);
  }

  // draw circle object
  fill(circleDraggable() ? 195 : 215);
  noStroke();
  ellipse(circle.pos.x, circle.pos.y, circle.radius);

  // start ray marching algorithm
  let np = rayMarch();
  if (np.x <= epsilon) {
    contactPoints.push(rO.copy().add(rD.copy().mult(np.y)));
  }

  contactPoints.forEach(function (el) {
    noStroke();
    fill(230, 161, 41);
    ellipse(el.x, el.y, 1.5);
  });
}

// change ray angle by scrolling
function mouseWheel(event) {
  angle += event.delta * 0.00005;

  rD = p5.Vector.fromAngle(angle);
  rD = rD.normalize();
}

// draggable objets
function mouseDragged() {
  if (originDraggable()) {
    rO = createVector(mouseX, mouseY);
    contactPoints = [];
  } else if (circleDraggable()) {
    circle.pos = createVector(mouseX, mouseY);
    contactPoints = [];
  } else if (rayDraggable()) {
    mP = createVector(mouseX, mouseY);
    rD = mP.copy().sub(rO.copy());
    rD = rD.normalize();
    right = createVector(1, 0, 0);
    angle = right.angleBetween(rD);
  }
}

// save canvas-screenshot
function keyPressed() {
  if (key === "s") {
    saveCanvas(c, "Raymarching", "png");
  }
}

// from https://editor.p5js.org/solub/sketches/JkjZA2ZOS
function orthogonalProjection(a, b, p) {
  d1 = p5.Vector.sub(b, a).normalize();
  d2 = p5.Vector.sub(p, a);
  d1.mult(d2.dot(d1));
  return p5.Vector.add(a, d1);
}
