var notifications = document.getElementById("notif");
notifications.addEventListener('DOMSubtreeModified', showHideNotifications);
var acInfoHolder  = document.getElementById("acInfoHolder");
var airTrafficApiUrl = 'https://public-api.adsbexchange.com/VirtualRadar/AircraftList.json';
var minRange = 0;
var maxRange = 100;
var aircraftList = [];
var lat = null;
var lng = null;
var flightOriginAirport = null;
var airplaineManuf = null;
var airLogo = null;

if (window.location.hash && window.location.hash === '#showflightinfo') {
    window.location.hash = "";
}

function showHideNotifications() {

    notifications.style.display = 'block';

    setTimeout(function() {
        notifications.style.display = 'none';
    }, 5000);

}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        notifications.innerHTML = "Geolocation is not supported by this browser.";
    }
}

function showPosition(position) {

    lat = position.coords.latitude;
    lng = position.coords.longitude;

    getFlightsListing(lat, lng, minRange, maxRange);
}

function httpGetAsync(url, params, callback) {

    let getUrl = url + '?lat=' + params.lat + "&lng=" + params.lng  + "&fDstL=" + params.fDstL  + "&fDstU=" + params.fDstU;

    var xhr = new XMLHttpRequest();

    xhr.open("GET", getUrl, true); // true for asynchronous

    xhr.onreadystatechange = function() {

        if (xhr.readyState == 4 && xhr.status == 200) {
            let airInfo = JSON.parse(xhr.responseText);
            callback(airInfo);
        } else if (xhr.readyState == 4 && xhr.status == 0) {
            notifications.innerHTML = "Please enable COSR extension.";
        } else if (xhr.readyState == 4) {
            notifications.innerHTML = "There was something wrong. Please try again later.";
        }

    }

    xhr.send(null);
}

function imgError(image) {
    image.onerror = "";
    image.src = "images/airplanedef.jpg";
    return true;
}

function sort() {
    aircraftList.sort(function(a, b) {
        return a.Alt - b.Alt;
    });
}

function getFlightsListing(lat, lng, minRange = 0, maxRange = 100) {

    let params = {};
    params.lat = lat;
    params.lng = lng;
    params.fDstL = minRange;
    params.fDstU = maxRange;

    httpGetAsync(airTrafficApiUrl, params, function (resp) {
        aircraftList = resp.acList;
        sort();
        renderInfo(aircraftList)
    });


}

function renderInfo () {

    aircraftList.map(function (item) {

        let routeAcInfo = document.createElement("a");
        routeAcInfo.setAttribute('href', "#showflightinfo");
        routeAcInfo.onclick = function () {
           
            flightOriginAirport = item.From;
            airplaineManuf = item.Man;
            airLogo = '//logo.clearbit.com/' + item.Op.trim().split(" ").join("") + `.com`;

        };
        
        let acInfoList = document.createElement('li');
        let fligthAlt = document.createElement('div');
        let fligthNumber = document.createElement('div');
        let eastWestBound = document.createElement("i");
        eastWestBound.classList.add("fa");
        if (item.TrkH) {
            eastWestBound.classList.add("fa-arrow-left");
        } else {
            eastWestBound.classList.add("fa-arrow-right");
        }
        fligthAlt.appendChild(document.createTextNode(item.Alt));
        fligthNumber.appendChild(document.createTextNode(item.Icao));
        acInfoList.appendChild(eastWestBound);
        acInfoList.appendChild(fligthAlt);
        acInfoList.appendChild(fligthNumber);
        routeAcInfo.appendChild(acInfoList);
        acInfoHolder.appendChild(routeAcInfo);
        
    });

}

// stratup functions

getLocation();

let getPeriodicalAcInfo = setInterval(function() {
    getFlightsListing(lat, lng, minRange, maxRange);
}, 1000 * 60);

window.onhashchange = function() {
    if (window.location.hash && window.location.hash === '#showflightinfo') {

        document.getElementById("flight-info").style.display = "block";
        document.getElementById("all-flights").style.display = "none";
        
        let image = document.createElement('img');
        image.setAttribute('src', airLogo);
        image.setAttribute('onerror', 'imgError(this)');
        document.getElementById("flight-info-image").appendChild(image);

        if (flightOriginAirport && flightOriginAirport != undefined) {
            document.getElementById("flight-info-manuf").innerText = flightOriginAirport;
        } else {
            document.getElementById("flight-info-manuf").style.display = "none";
        }
        
        document.getElementById("flight-info-alt").innerText = airplaineManuf;

    } else {
        document.getElementById("flight-info").style.display = "none";
        document.getElementById("all-flights").style.display = "block";
        document.getElementById("flight-info-manuf").style.display = "block";
        
        document.getElementById("flight-info-image").innerHTML = "";
        document.getElementById("flight-info-manuf").innerText = "";
        document.getElementById("flight-info-alt").innerText = "";

        flightOriginAirport = null;
        airplaineManuf = null;
        airLogo = null;
    }

}

// clearInterval(getPeriodicalAcInfo);