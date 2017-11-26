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
