function isTrue(currentValue) {
      return currentValue == true;
}
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
  var table = $('#plants').DataTable({
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
    $('.feet li').each(function() {
      var feetStr = $(this).text().substr(0, $(this).text().indexOf(':'));
      $(this).text( feetStr + ' : ' +  $(this).text().match(regex).map(function(v) { return (parseFloat(v) * 0.3048).toFixed(2); }) +' Meters' );
    });
    $('.inches li').each(function() {
      var inchStr = $(this).text().substr(0, $(this).text().indexOf(':'));
      $(this).text( inchStr + ' : ' +  $(this).text().match(regex).map(function(v) { return (parseFloat(v) * 2.54).toFixed(2); }) +' Centimeters' );
    });
    $('.farenheit li').each(function() {
      var farStr = $(this).text().substr(0, $(this).text().indexOf(':'));
      $(this).text( farStr + ' : ' +  $(this).text().match(regex).map(function(v) { return ((parseFloat(v) - 32)/(9/5)).toFixed(2); }) +' C' );
    });
    $('table[id="plants"] thead tr td:nth-child(5)').each(function() {
      $(this).text('Water Needed (Cm)');
    });    
    $('table[id="plants"] tbody tr td:nth-child(5)').each(function() {
      var currText = (parseFloat($(this).text())*2.54).toFixed(2);
      $(this).text(currText);
    });
    $('table[id="plants"] thead tr td:nth-child(6)').each(function() {
      $(this).text('Min. Temp (C)');
    });    
    $('table[id="plants"] tbody tr td:nth-child(6)').each(function() {
      var currText = ((parseFloat($(this).text()) - 32)/(9/5)).toFixed(2);
      $(this).text(currText);
    });
    $('table[id="plants"] tbody tr td:nth-child(7)').each(function() {
      var currText = ((parseFloat($(this).text()) - 32)/(9/5)).toFixed(2);
      $(this).text(currText);
    });
    $('table[id="plants"] thead tr td:nth-child(7)').each(function() {
      $(this).text('Max. Temp (C)');
    });  
    alert ("All units have been changed to metric units.");
  } else {
    $('.feet li').each(function() {
      var feetStr = $(this).text().substr(0, $(this).text().indexOf(':'));
      $(this).text( feetStr + ' : ' +  $(this).text().match(regex).map(function(v) { return (parseFloat(v) * 3.28084).toFixed(2); }) +' Feet' );
    });
    $('.inches li').each(function() {
      var inchStr = $(this).text().substr(0, $(this).text().indexOf(':'));
      $(this).text( inchStr + ' : ' +  $(this).text().match(regex).map(function(v) { return (parseFloat(v) * 0.393701).toFixed(2); }) +' Inches' );
    });
    $('.farenheit li').each(function() {
      var farStr = $(this).text().substr(0, $(this).text().indexOf(':'));
      $(this).text( farStr + ' : ' +  $(this).text().match(regex).map(function(v) { return ((parseFloat(v)*1.8) + (32)).toFixed(2); }) +' F' );
    });  
    $('table[id="plants"] thead tr td:nth-child(5)').each(function() {
      $(this).text('Water Needed (In)');
    });    
    $('table[id="plants"] tbody tr td:nth-child(5)').each(function() {
      var currText = (parseFloat($(this).text())*0.393701).toFixed(2);
      $(this).text(currText);
    });
    $('table[id="plants"] thead tr td:nth-child(6)').each(function() {
      $(this).text('Min. Temp (F)');
    });    
    $('table[id="plants"] tbody tr td:nth-child(6)').each(function() {
      var currText = ((parseFloat($(this).text()) *1.8)+(32)).toFixed(2);
      $(this).text(currText);
    });
    $('table[id="plants"] tbody tr td:nth-child(7)').each(function() {
      var currText = ((parseFloat($(this).text()) *1.8)+ 32).toFixed(2);
      $(this).text(currText);
    });
    $('table[id="plants"] thead tr td:nth-child(7)').each(function() {
      $(this).text('Max. Temp (F)');
    });  
    alert ("All units have been changed back to imperial units.");
  }
}
