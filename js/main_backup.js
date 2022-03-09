/* Map of GeoJSON data from my own data which shows the distribution of Winter Olympics athletes from 1994-2022 */
var body = document.getElementsByTagName("body")[0];
body.style.backgroundColor = "#c1c9cc";

var h1 = document.createElement('h1');
h1.innerHTML = "Winter Olympics Worldwide Athletes 1994-2022";
h1.style.backgroundColor = "#c1c9cc";
var div = document.getElementById("others");
div.appendChild(h1);
//declare map var in global scope
var map;
var minValue = 1;
var dataStats = [];

function PopupContent(properties, attribute) {
    this.properties = properties;
    this.attribute = attribute;
    this.year = attribute;
    this.athletes = this.properties[attribute];
    this.formatted = "<p><b>Country:</b> " + this.properties.Country + "</p>" + "<p><b>" + "Number of athletes in <b>" + this.attribute + ":</b> " + this.athletes + "</p>";
}

//function to instantiate the Leaflet map
function createMap() {
    //create the map
    map = L.map('map', {
        center: [30, 0],
        zoom: 2
    });

    //add OSM base tilelayer
    L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    //call getData function
    getData();

};
//function to retrieve the data and place it on the map
function getData() {
    //load the data
    fetch("data/OlympicAthletes.geojson")
        .then(function (response) {
            return response.json();
        })
        .then(function (json) {
            var attributes = processData(json);
            calcStats(json);
            createPropSymbols(json, attributes);
            createSequenceControls(attributes);

            createLegend(attributes);

        });
};

function calcStats(data) {
    //create empty array to store all data values
    var allValues = [];
    //loop through each city
    for (var country of data.features) {
        //loop through each year
        for (var year = 1994; year <= 2022; year += 4) {
            //get population for current year
            var value = country.properties[String(year)];
            //add value to array
            allValues.push(value);
        }
    }
    //get min, max, mean stats for our array
    dataStats.push(Math.max(...allValues));
    var sum = allValues.reduce(function (a, b) { return a + b; });
    dataStats.push(sum / allValues.length);
    dataStats.push(Math.min(...allValues));

    //calculate meanValue

    console.log("This is : " + dataStats[0]);
}

function createLegend(attributes) {
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function () {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');

            container.innerHTML = '<p class="temporalLegend">Number of athletes in <span class="year">1994</span></p>';

            //Step 1: start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="130px" height="130px">';

            //add attribute legend svg to container
            //container.innerHTML += svg;
            //array of circle names to base loop on
            var circles = ["max", "mean", "min"];

            //Step 2: loop to add each circle and text to svg string
            console.log("dataStats is: " + dataStats);
            for (var i = 0; i < circles.length; i++) {
                //Step 3: assign the r and cy attributes    
                console.log(dataStats[0]);
                var radius = calcPropRadius(dataStats[i]);
                var cy = 130 - radius;
                console.log("radius is: " + radius);
                //circle string            
                svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#F47821" fill-opacity="0.8" stroke="#000000" cx="65"/>';

                //evenly space out labels            
                var textY = i * 20 + 20;

                //text string            
                svg += '<text id="' + circles[i] + '-text" x="65" y="' + textY + '">' + Math.round(dataStats[i] * 100) / 100 + "athletes" + '</text>'
            };

            //close svg string
            svg += "</svg>";

            //add attribute legend svg to container
            container.insertAdjacentHTML('beforeend', svg);
            return container;
        }
    });

    map.addControl(new LegendControl());

};
//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //constant factor adjusts symbol sizes evenly
    if (attValue > 0) {
        var minRadius = 5;
        //Flannery Apperance Compensation formula
        var radius = 0.5 * Math.pow(attValue / minValue, 0.5715) * minRadius;
    }
    else {
        radius = 0;
    }
    return radius;
};

/////////////////////////////////////////////
function pointToLayer(feature, latlng, attributes) {
    //Step 4: Assign the current attribute based on the first index of the attributes array

    var attribute = attributes[0];
    //check

    //var attribute = "1994";
    //create marker options
    var options = {
        radius: 8,
        fillColor: "#90EE90",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);
    // var popupContent = createPopupContent(feature.properties, attribute);
    var popupContent = new PopupContent(feature.properties, attribute);

    layer.bindPopup(popupContent.formatted);

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
}
////////////////////////////////////////////

function createPropSymbols(data, attributes) {
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
}


function createSequenceControls(attributes) {
    //create range input element (slider)
    document.querySelector('#panel').insertAdjacentHTML('afterbegin', '<button class="step" id="backward"></button>');
    var slider = "<input class='range-slider' type='range'> </input>";
    document.querySelector("#panel").insertAdjacentHTML('beforeend', slider);
    //set slider attributes
    document.querySelector(".range-slider").max = 7;
    document.querySelector(".range-slider").min = 0;
    document.querySelector(".range-slider").value = 0;
    document.querySelector(".range-slider").step = 1;

    document.querySelector('#panel').insertAdjacentHTML('beforeend', '<button class="step" id="forward"></button>');
    document.querySelector('#backward').insertAdjacentHTML('afterbegin', "<img src='img/backward.png'>");
    document.querySelector('#forward').insertAdjacentHTML('beforeend', "<img src='img/forward.png'>");
    document.querySelectorAll('.step').forEach(function (step) {
        step.addEventListener("click", function () {
            var index = document.querySelector('.range-slider').value;
            if (step.id == "forward") {
                index++;
                index = index > 7 ? 0 : index;
            }
            else {
                index--;
                index = index < 0 ? 7 : index;
            }
            document.querySelector('.range-slider').value = index;
            updatePropSymbols(attributes[index]);
        })
    })
    document.querySelector('.range-slider').addEventListener('input', function () {
        var index = document.querySelector('.range-slider').value;
        document.querySelector('.range-slider').value = index;

        updatePropSymbols(attributes[index]);
    });
    document.querySelector('#forward').insertAdjacentHTML("afterend", '<br><h id = "intervals"><h id = "start">1994</h><h id = "intervalA">1998</h><h id = "intervalB">2002</h><h id = "intervalC">2006</h><h id = "intervalD">2010</h><h id = "intervalE">2014</h><h id = "intervalF">2018</h></h><h id = "end">2022</h>');
};

function updatePropSymbols(attribute) {
    map.eachLayer(function (layer) {
        if (layer.feature) {

            //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            // var popupContent = createPopupContent(props, attribute);
            var popupContent = new PopupContent(props, attribute);
            //update popup content            
            popup = layer.getPopup();
            popup.setContent(popupContent.formatted).update();
        };
    });
};

function processData(data) {
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties) {

        if (Number.isInteger(parseInt(attribute)) == true) {
            attributes.push(attribute);
        }
    };

    //check result


    return attributes;
};

function createPopupContent(props, attribute) {
    var popupContent = "<p><b>Country:</b> " + props.Country + "</p>";

    //add formatted attribute to panel content string

    popupContent += "<p><b>" + "Number of athletes in <b>" + attribute + ":</b> " + props[attribute] + "</p>";
    return popupContent;
}


document.addEventListener('DOMContentLoaded', createMap);

