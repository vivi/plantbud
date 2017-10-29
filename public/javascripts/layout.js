var hitOptions = {
  segments: true,
  stroke: true,
  fill: true,
  tolerance: 5
};

paper.settings.handleSize = 1;
var perimeter;
var perimeter_outline;

function initialize(perimeter) {
  paper.setup('layout');
  var currLayer = paper.project.activeLayer;
  var layer = new paper.Layer();
  drawPerimeter(perimeter);
  currLayer.activate();
}

function drawPerimeter(perPoints) {
  var gradient = new paper.Gradient(['green', 'aquamarine']);
  segments = [];
  perPoints.forEach(function(el) {
    // el: (x, y)
    segments.push(new paper.Point(el[0], el[1]));
  });
  perimeter_outline = new paper.Path(segments);
  perimeter = new paper.CompoundPath({
    children: [
      perimeter_outline,
      new paper.Path.Rectangle(paper.view.bounds),
    ],
    fillRule: 'evenodd',
    fillColor: new paper.Color(gradient, new paper.Point(0, 0), new paper.Point(600, 600)),
    strokeColor: 'black',
    dashArray: [4, 10],
    strokeWidth: 2,
    strokeCap: 'round'
  });
}

function createBox(name, size) {
  var pos = perimeter_outline.position;
  var rect = new paper.Rectangle(pos, new paper.Size(size, size));
  var path = new paper.Path.Rectangle(rect);
  path.fillColor = '#FFFFFF';
  path.strokeColor = 'black';
  path.strokeWidth = 1;


  var label = new paper.PointText(path.position);
  label.fillColor = 'black';
  label.content = name;

  new paper.Group([path, label]);
}

var group;
function onMouseDown(event) {
  if (!event.item || event.item == perimeter) {
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
  if (event.item && event.item != perimeter) {
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
      if (group.intersects(perimeter)) {
        group.position = oldpos;
      }
  }
}

var tool = new paper.Tool();
tool.onMouseMove = onMouseMove;
tool.onMouseDrag = onMouseDrag;
tool.onMouseDown = onMouseDown;

