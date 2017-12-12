function isTrue(currentValue) {
      return currentValue == true;
}
var table;
$(document).ready(function() {
  $.fn.dataTableExt.afnFiltering.push(function(oSettings, aData, iDataIndex) {
    var active = [];
    var perennial = $('#perennial').is(':checked');
    var hasPer = aData[7].includes("perennial");
    if (perennial) {
      active.push(hasPer);
    }

    var annual = $('#annual').is(':checked');
    var hasAnn = aData[7].includes("annual");
    if (annual) {
      active.push(hasAnn);
    }

    var fruit = $('#fruit').is(':checked');
    var hasFruit = aData[3].includes("fruits");
    if (fruit) {
      active.push(hasFruit);
    }
    var med = $('#medicinal').is(':checked');
    var hasMed = aData[3].includes("medicinal");
    if (med) {
      active.push(hasMed);
    }

    var orn = $('#ornamental').is(':checked');
    var hasOrn = aData[3].includes("ornamentals");
    if (orn) {
      active.push(hasOrn);
    }

    return active.every(isTrue);
  });
    table = $('#plants').DataTable({
    columnDefs: [ {
      targets: 0,
      orderable: false
    },
    {
      targets: 1,
      render: function ( data, type, row ) {
          if (data.length > 50) {
            return data.substr( 0, 50 ) + '...[truncated]';
          } else {
            return data;
          }
      }
    },
    {
      targets: [4, 5, 6],
      render: function(data, type, row) {
        var d = parseInt(data);
        if (!d || d == -10000) {
          return "";
        } else {
          return data;
        }
      }
    }],
    "order": [[ 2, "desc" ]]
  });

  $('.filter').on("click", function(e) {
    table.draw();
  });
});

function validateAndSend() {
  if ($("[name='select_plant']:checked").length > 0) {
    $('#plant_form').submit();
  } else {
    alert('Please select at least one plant.');
    return false;
  }
}

function changeUnits(checkboxElem) {
  var regex = /[+-]?\d+(\.\d+)?/g;
  if (checkboxElem.checked) {
    $('.feet').each(function() {
      var feetStr = $(this).text().substr(0, $(this).text().indexOf(':'));
      $(this).text( feetStr + ' : ' +  $(this).text().match(regex).map(function(v) { return (parseFloat(v) * 0.3048).toFixed(2); }) +' Meters' );
    });
    $('.inches').each(function() {
      var inchStr = $(this).text().substr(0, $(this).text().indexOf(':'));
      $(this).text( inchStr + ' : ' +  $(this).text().match(regex).map(function(v) { return (parseFloat(v) * 2.54).toFixed(2); }) +' Centimeters' );
    });
    $('.farenheit').each(function() {
      var farStr = $(this).text().substr(0, $(this).text().indexOf(':'));
      $(this).text( farStr + ' : ' +  $(this).text().match(regex).map(function(v) { return ((parseFloat(v) - 32)/(9/5)).toFixed(2); }) +' C' );
    });
    allToMetric();
    alert ("All units have been changed to metric units.");
  } else {
    $('.feet').each(function() {
      var feetStr = $(this).text().substr(0, $(this).text().indexOf(':'));
      $(this).text( feetStr + ' : ' +  $(this).text().match(regex).map(function(v) { return (parseFloat(v) * 3.28084).toFixed(2); }) +' Feet' );
    });
    $('.inches').each(function() {
      var inchStr = $(this).text().substr(0, $(this).text().indexOf(':'));
      $(this).text( inchStr + ' : ' +  $(this).text().match(regex).map(function(v) { return (parseFloat(v) * 0.393701).toFixed(2); }) +' Inches' );
    });
    $('.farenheit').each(function() {
      var farStr = $(this).text().substr(0, $(this).text().indexOf(':'));
      $(this).text( farStr + ' : ' +  $(this).text().match(regex).map(function(v) { return ((parseFloat(v)*1.8) + (32)).toFixed(2); }) +' F' );
    });
    allToImperial();
    alert ("All units have been changed back to imperial units.");
  }
}

const CM_PER_IN = 2.54
function allToMetric() {
  var all = table.data();
  $('.water').html("Water Needed (cm)");
  $('.min_temp').html("Min. Temp (C)");
  $('.max_temp').html("Max. Temp (C)");
  for (var i = 0; i < all.length; i++) {
    all[i][4] = (parseFloat(all[i][4]) * CM_PER_IN).toFixed(2).toString();
    all[i][5] = (parseFloat(all[i][5]) - 32 * 5 / 9).toFixed(2).toString();
    all[i][6] = (parseFloat(all[i][6]) - 32 * 5 / 9).toFixed(2).toString();
  }
  table.clear().rows.add(all).draw();
}

function allToImperial() {
  var all = table.data();
  $('.water').html("Water Needed (In)");
  $('.min_temp').html("Min. Temp (F)");
  $('.max_temp').html("Max. Temp (F)");
  for (var i = 0; i < all.length; i++) {
    all[i][4] = (parseFloat(all[i][4]) / CM_PER_IN).toFixed(2).toString();
    all[i][5] = (parseFloat(all[i][5]) * 9 / 5 + 32).toFixed(2).toString();
    all[i][6] = (parseFloat(all[i][6]) * 9 / 5 + 32).toFixed(2).toString();
  }
  table.clear().rows.add(all).draw();
}
