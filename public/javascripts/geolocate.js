function geolocate() {
    $('#locate-error').html('');
    if (navigator.geolocation) {
        $('.spin').css('display', 'inline');
        navigator.geolocation.getCurrentPosition(showPosition, error);
    } else {
        $('.spin').css('display', 'none');
        $('#locate-error').innerHTML("Geolocation is not supported by this browser.");
    }
}

function error(err) {
    console.log(`error: ${err.message}`);
    $('#locate-error').html(`error: ${err.message}`);
    $('.spin').css('display', 'none');
};

function showPosition(position) {
    $('#lat').val(position.coords.latitude);
    $('#lon').val(position.coords.longitude);
    $('.spin').css('display', 'none');
}
