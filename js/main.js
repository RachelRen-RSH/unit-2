/* Map of GeoJSON data from my own data which shows the distribution of Winter Olympics athletes from 1994-2022 */
var body = document.getElementsByTagName("body")[0];


var h1 = document.createElement('h1');
h1.innerHTML = "Winter Olympic Worldwide Athletes 1994-2022";
h1.style.backgroundColor = "#DCDCDC";
var div = document.getElementById("others");
div.appendChild(h1);
//declare map var in global scope
var map;
//function to instantiate the Leaflet map
function createMap() {
    //create the map
    map = L.map('map', {
        center: [20, 0],
        zoom: 2
    });

    //add OSM base tilelayer
    L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    //call getData function
    getData();

};



function onEachFeature(feature, layer) {
    //no property named popupContent; instead, create html string with all properties
    var popupContent = "";
    if (feature.properties) {
        //loop to add feature property names and values to html string
        for (var property in feature.properties) {
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popupContent);
    };
};

//function to retrieve the data and place it on the map
function getData() {
    //load the data
    fetch("data/OlympicAthletes.geojson")
        .then(function (response) {
            return response.json();
        })
        .then(function (json) {
            //create marker options
            var geojsonMarkerOptions = {
                radius: 8,
                fillColor: "#90EE90",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
            //create a Leaflet GeoJSON layer and add it to the map
            L.geoJson(json, {
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                },
                onEachFeature: onEachFeature
            }).addTo(map);
        });
};

document.addEventListener('DOMContentLoaded', createMap)


