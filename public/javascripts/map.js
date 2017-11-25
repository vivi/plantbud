/* Credit: https://codepen.io/jhawes/post/creating-a-real-estate-polygon-tool */
var TILE_SIZE = 256;

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
  // Polygon Coordinates - Draw a default square around the user's coordinates.
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

/*
 * Mercator Projection
 * developers.google.com/maps/documentation/javascript/examples/map-coordinates
 */
function project(latLng) {
  var siny = Math.sin(latLng.lat() * Math.PI / 180);

  // Truncating to 0.9999 effectively limits latitude to 89.189. This is
  // about a third of a tile past the edge of the world tile.
  siny = Math.min(Math.max(siny, -0.9999), 0.9999);

  return new google.maps.Point(
      TILE_SIZE * (0.5 + latLng.lng() / 360),
      TILE_SIZE * (0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI)));
}

/*
 * Called whenever the polygon is updated.
 *   - Calculates the new area of the polygon.
 *   - Updates the information we will POST to `/layout`, including the outline
 *     path, area, and MPP (meters per pixel)
 */
function getPolygonCoords() {
  var path = myPolygon.getPath();
  var len = path.getLength();
  var zoom = map.getZoom();

  // Update area.
  var area = google.maps.geometry.spherical.computeArea(myPolygon.getPath());
  $('#area').html(parseFloat(Math.round(area * 100) / 100).toFixed(3));
  $('#f-area').val(parseFloat(Math.round(area * 100) / 100).toFixed(3));

  var bounds = new google.maps.LatLngBounds();
  var scale = 1 << zoom;
  pixels = [];
  for (var i =0; i < len; i++) {
    // Convert from lat-lon to xy (pixel) coordinates
    var latLng = path.getAt(i);
    var worldCoordinate = project(latLng);
    var pixelCoordinate = new google.maps.Point(
            Math.floor(worldCoordinate.x * scale),
            Math.floor(worldCoordinate.y * scale));
    pixels.push(pixelCoordinate);

    // Extend the boundary of the map, so the entire polygon is encompassed.
    if (!bounds.contains(latLng)) {
      bounds.extend(latLng);
    }
  }
  map.fitBounds(bounds);

  // XXX: Is this the correct MPP (meters-per-pixel)? Google says so.
  // https://groups.google.com/forum/#!topic/google-maps-js-api-v3/hDRO4oHVSeM
  var refLat = path.getAt(0).lat();
  var mpp = 156543.03392 * Math.cos(refLat * Math.PI / 180) / Math.pow(2, zoom);

  // Translate so that leftmost x-coord = 0, top y-coord = 0.
  min_x = Number.POSITIVE_INFINITY;
  min_y = Number.POSITIVE_INFINITY;
  for (var i = 0; i < len; i++) {
    var coord = pixels[i];
    if (coord.x < min_x) {
      min_x = coord.x;
    }
    if (coord.y < min_y) {
      min_y = coord.y;
    }
  }

  // Build the string to fill in the invisible form field.
  var str = "";
  var first = "";
  for (var i = 0; i < len; i++) {
    var coord = pixels[i];
    str += "(" + (coord.x - min_x) + "," + (coord.y - min_y) + ")";
    if (i == 0) {
      first = str;
    }
    str += ";"
  }
  str += first;
  $('#f-verts').val(str);
  $('#f-mpp').val(mpp);
}

/* Hides both mapping options. */
function closeAll() {
  $('#usemap').slideUp(200);
  $('#manual').slideUp(200);
}

/* Shows manual rectangle input. */
function useManual() {
  if ($('#manual').is(":visible")) {
    return;
  }
  closeAll();
  $('#manual').slideDown(200);
}

/* Shows mapping tool. */
function useMap() {
  if ($('#usemap').is(":visible")) {
    return;
  }
  closeAll();
  $('#usemap').slideDown(200);
}


/* Manual input. */
var width = 0;
var height = 0;
$('#width').on('input', function() {
    width = parseFloat($(this).val());
    $('#f-area').val(parseFloat(width * height).toFixed(3));
    updateVertex();
});

$('#height').on('input', function() {
    height = parseFloat($(this).val());
    $('#f-area').val(parseFloat(width * height).toFixed(3));
    updateVertex();
});

/* Updates the path of the rectangle. */
// TODO: Scale the rectangle.
function updateVertex() {
  var vert = "[0,0];["+width+",0];["+width+","+height+"];[0,"+height+"];[0,0]";
  $('#f-verts').val(vert);
  $('#f-mpp').val(1);
}
