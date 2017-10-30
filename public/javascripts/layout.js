paper.settings.handleSize = 1;
var perimeter; // The box with area outside the perimeter shaded
var perimeter_outline;
var MPP; // Meters per pixel
var FPM = 3.28; // Feet per meter

function initialize(perimeter, mpp) {
  MPP = mpp;
  paper.setup('layout');
  var plantLayer = paper.project.activeLayer;
  plantLayer.name = 'plants';
  var perimLayer = new paper.Layer();
  perimLayer.name = 'perimeter';
  drawPerimeter(perimeter);
  drawGrid();
  plantLayer.insertAbove(perimLayer);
  plantLayer.activate();
}

function drawPerimeter(perPoints) {
  segments = [];
  perPoints.forEach(function(el) { // el: (x, y)
    segments.push(new paper.Point(el[0], el[1]));
  });
  fit(segments);
  perimeter_outline = new paper.Path(segments);
  perimeter = new paper.CompoundPath({
    children: [
      perimeter_outline,
      new paper.Path.Rectangle(paper.view.bounds),
    ],
    fillRule: 'evenodd',
    strokeColor: 'black',
    strokeWidth: 2,
    strokeCap: 'round',
    dashArray: [2, 2],
  });

  // How many pixels per meter
  // TODO: Fix for when there is more than one meter per pixel.
  var pixels = 1 / MPP;
  var scale = new paper.Path.Line(perimeter_outline.bounds.bottomRight.add(new paper.Point(5, -5)),
  perimeter_outline.bounds.bottomRight.add(new paper.Point(pixels + 5, -5)));
  scale.strokeColor = 'black';
  var label = new paper.PointText(scale.bounds.bottomRight.add(new paper.Point(0, 2)));
  label.fillColor = 'black';
  label.content = '1 meter';
}

function drawGrid() {
  var width = paper.view.bounds.width;
  var height = paper.view.bounds.height;

  // TODO: Fix for when there is more than one meter per pixel.
  PPM = 1 / MPP;
  for (var i = 1; i < width / PPM; i++) {
    var from = new paper.Point(i * PPM, 0);
    var to = new paper.Point(i * PPM, height);
    var line = new paper.Path.Line(from, to);
    line.strokeColor = new paper.Color(0.5, 0.5);
    line.strokeWidth = 0.5;
    line.dashArray = [2, 2];
  }

  for (var i = 1; i < height / PPM; i++) {
    var from = new paper.Point(0, i * PPM);
    var to = new paper.Point(width, i* PPM);
    var line = new paper.Path.Line(from, to);
    line.strokeColor = new paper.Color(0.5, 0.5);
    line.strokeWidth = 0.5;
    line.dashArray = [2, 2];
  }
}

/* Fit the perimeter to the size of the canvas. */
function fit(segments) {
  var width = paper.view.size.width - 40;
  var height = paper.view.size.height - 40;
  var max_x = 0;
  var max_y = 0;
  segments.forEach(function(el) {
    if (el.x > max_x)
      max_x = el.x;
    if (el.y > max_y)
      max_y = el.y;
  });
  var x_factor;
  var y_factor;
  var factor;
  if (max_x > width || max_y > height) {
    x_factor = max_x / width;
    y_factor = max_y / height;
    factor = 1 / Math.max(x_factor, y_factor);
  } else {
    x_factor = width / max_x;
    y_factor = height / max_y;
    factor = Math.min(x_factor, y_factor);
  }
  console.log(factor);
  MPP /= factor;
  scale(segments, factor);
  translate(segments, 20);
}

function translate(segments, pixels) {
  for (var i = 0; i < segments.length; i++) {
    segments[i] = segments[i].add(pixels);
  }
}

function scale(segments, factor) {
  for (var i = 0; i < segments.length; i++) {
    segments[i] = segments[i].multiply(factor);
  }
}

/* Creates a plant box. */
function createBox(name, feet) {
  var meters = feet / FPM;
  var pixels = Math.ceil(meters / MPP);
  var pos = perimeter_outline.position;
  var rect = new paper.Rectangle(pos, new paper.Size(pixels, pixels));
  var path = new paper.Path.Rectangle(rect);
  path.fillColor = '#FFFFFF';
  path.strokeColor = 'black';
  path.strokeWidth = 1;


  var label = new paper.PointText(path.position.subtract(new paper.Point(pixels / 2, -3)));
  label.fillColor = 'black';
  label.content = name;

  new paper.Group([path, label]);
}

var group;
function onMouseDown(event) {
  if (!event.item || event.item.parent != paper.project.activeLayer) {
    group = null;
    return;
  }
  if (event.modifiers.shift) {
    group = null;
    event.item.remove();
    return;
  }
  group = event.item;
}

function onMouseMove(event) {
  paper.project.activeLayer.selected = false;
  if (event.item && event.item.parent == paper.project.activeLayer) {
    event.item.selected = true;
  }
}

var zero = new paper.Point(0, 0);
function onMouseDrag(event) {
  if (group) {
      var oldpos = group.position;
      var newpos = group.position.add(event.delta);
      var relZero = zero.add(group.bounds.width / 2);
      group.position = paper.Point.max(newpos, relZero);
      if (group.firstChild.intersects(perimeter)) {
        group.position = oldpos;
      }
  }
}

var tool = new paper.Tool();
tool.onMouseMove = onMouseMove;
tool.onMouseDrag = onMouseDrag;
tool.onMouseDown = onMouseDown;
