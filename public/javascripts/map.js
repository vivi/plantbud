// Credit: https://codepen.io/jhawes/post/creating-a-real-estate-polygon-tool
function initialize(lat, lon) {
  // Map Center
  var myLatLng = new google.maps.LatLng(lat, lon);
  // General Options
  var mapOptions = {
    zoom: 20,
    center: myLatLng,
    mapTypeId: 'hybrid'
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),mapOptions);
  // Polygon Coordinates - Draw a default square.
  var FUZZ = 0.0003;
  var rectCoords = [
    new google.maps.LatLng(lat, lon),
    new google.maps.LatLng(lat, lon + FUZZ),
    new google.maps.LatLng(lat + FUZZ, lon + FUZZ),
    new google.maps.LatLng(lat + FUZZ, lon),
  ];

  // Styling & Controls
  myPolygon = new google.maps.Polygon({
    paths: rectCoords,
    draggable: true,
    editable: true,
    strokeColor: '#FF0000',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#FF0000',
    fillOpacity: 0.35
  });

  myPolygon.setMap(map);

  // Populate area
  getPolygonCoords();

  // Listeners for when polygon is updated
  google.maps.event.addListener(myPolygon.getPath(), "insert_at", getPolygonCoords);
  google.maps.event.addListener(myPolygon.getPath(), "set_at", getPolygonCoords);
}

var TILE_SIZE = 256;

// Mercator Projection.
// https://developers.google.com/maps/documentation/javascript/examples/map-coordinates?csw=1
function project(latLng) {
  var siny = Math.sin(latLng.lat() * Math.PI / 180);

  // Truncating to 0.9999 effectively limits latitude to 89.189. This is
  // about a third of a tile past the edge of the world tile.
  siny = Math.min(Math.max(siny, -0.9999), 0.9999);

  return new google.maps.Point(
      TILE_SIZE * (0.5 + latLng.lng() / 360),
      TILE_SIZE * (0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI)));
}

// Called whenever the polygon is updated.
// Updates the information we will send to `/layout`.
function getPolygonCoords() {
  var path = myPolygon.getPath();
  var len = path.getLength();

  // Update area
  var area = google.maps.geometry.spherical.computeArea(myPolygon.getPath());
  $('#area').html(parseFloat(Math.round(area * 100) / 100).toFixed(3));
  $('#f-area').val(parseFloat(Math.round(area * 100) / 100).toFixed(3));

  var bounds = new google.maps.LatLngBounds();
  var scale = 1 << map.getZoom();
  pixels = [];
  for (var i =0; i < len; i++) {
    // Convert from lat-lon to xy coordinates
    var latLng = path.getAt(i);
    var worldCoordinate = project(latLng);
    var pixelCoordinate = new google.maps.Point(
            Math.floor(worldCoordinate.x * scale),
            Math.floor(worldCoordinate.y * scale));
    pixels.push(pixelCoordinate);

    // Extend the boundary of the map, so the entire polygon is encompassed.
    bounds.extend(latLng);
  }
  map.fitBounds(bounds);

  // TODO: Is this the correct MPP (meters-per-pixel)? Google says so.
  var mpp = 156543.03392 * Math.cos(path.getAt(0).lat() * Math.PI / 180) / Math.pow(2, map.getZoom());

  // Translate so that leftmost x-coord = 0, top y-coord = 0.
  min_x = Number.POSITIVE_INFINITY
  min_y = Number.POSITIVE_INFINITY
  for (var i = 0; i < len; i++) {
    var coord = pixels[i];
    if (coord.x < min_x) {
      min_x = coord.x;
    }
    if (coord.y < min_y) {
      min_y = coord.y;
    }
  }

  var str = "";
  for (var i = 0; i < len; i++) {
    var coord = pixels[i];
    str += "(" + (coord.x - min_x) + "," + (coord.y - min_y) + ")";
    str += ";"
  }
  $('#f-verts').val(str);
  $('#f-mpp').val(mpp);
}

function closeAll() {
  $('#usemap').slideUp(200);
  $('#manual').slideUp(200);
}

function useManual() {
  if ($('#manual').is(":visible")) {
    return;
  }
  closeAll();
  $('#manual').slideDown(200);
}

function useMap() {
  if ($('#usemap').is(":visible")) {
    return;
  }
  closeAll();
  $('#usemap').slideDown(200);
}


// Manual Input
var width = 0;
var height = 0;
$('#width').on('input', function() { 
    width = parseFloat($(this).val()); // get the current value of the input field.
    $('#f-area').val(parseFloat(width * height).toFixed(3));
    $('#f-mpps').val(mpps);
    updateVertex();
});

$('#height').on('input', function() { 
    height = parseFloat($(this).val()); // get the current value of the input field.
    $('#f-area').val(parseFloat(width * height).toFixed(3));
    updateVertex();
});

function updateVertex() {
  var vert = "(0,0);("+width+",0);("+width+","+height+");(0,"+height+");(0,0)";
  $('#f-verts').val(vert);
  $('#f-mpp').val(1);
}
