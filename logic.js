// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson";

var faultLinesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});
d3.json(faultLinesURL, function(data){
  //createFeatures(data.features);
});

function getColor(d) {
  return d >= 5 ? 'black' : // Means: if (d >= 5) return 'black' else…
    d >= 4 ? 'red' : 
    d >= 3 ? 'orange' :
    d >= 2 ? 'yellow' :
    d >= 1 ? 'green' :
    'blue' ;
    //d >= 2 ? '' :
    //d >= 1.5 ? '' :// Note that numbers must be in descending order
    //d >= 1 ? '' :
    //'grey';
}
function createFeatures(earthquakeData, faultLineData) {


  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  // function onEachFeature(feature, layer) {
  //   layer.bindPopup("<h3>" + feature.properties.place +
  //     "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  // }
  // function createCircleMarker( feature, latlng ){
  //   // Change the values of these options to change the symbol's appearance
  //   let options = {
  //     radius: feature.properties.mag,
  //     fillColor: "lightgreen",
  //     color: "black",
  //     weight: 1,
  //     opacity: 1,
  //     fillOpacity: 0.8
  //   }
  //   return L.circleMarker( latlng, options );
  var earthquakes = L.geoJson(earthquakeData//, {
    //style: function(feature) {
      //  return {color: feature.properties.mag};
    //}
    ,{
    pointToLayer: function(feature, latlng) {
        return new L.CircleMarker(latlng, {radius: (feature.properties.mag * 3.5), color: getColor(feature.properties.mag), fillOpacity: 0.85});
    },
    onEachFeature: function (feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place + "<h3><hr> Magnitude: " + feature.properties.mag + "<hr><p>" + new Date(feature.properties.time) + "<p>");
    }
  //L.geoJSON(earthquakes, {
   // pointToLayer: createCircleMarker // Call the function createCircleMarker to create the symbol for this layer
  })//.addTo(myMap);
  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  //var earthquakes = L.geoJSON(earthquakeData, {
    //onEachFeature: onEachFeature;
    //onEachFeature: createCircleMarker
  //});
    function onEachFaultLine(feature, layer) {
      L.polyline(feature.geometry.coordinates);
    };
    var faultLines = L.geoJSON(faultLineData, {
    onEachFeature: onEachFaultLine,
    style: {
        weight: 2,
        color: 'black'
    }
    }); 


  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes, faultLines);
}

function createMap(earthquakes, faultLines) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoidHJhdmlzZG9lc21hdGgiLCJhIjoiY2poOWNrYjRkMDQ2ejM3cGV1d2xqa2IyeCJ9.34tYWBvPBM_h8_YS3Z7__Q"
  );

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoidHJhdmlzZG9lc21hdGgiLCJhIjoiY2poOWNrYjRkMDQ2ejM3cGV1d2xqa2IyeCJ9.34tYWBvPBM_h8_YS3Z7__Q"
  );

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    'Fault Lines': faultLines
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, earthquakes]
  })
  ;

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Setting up the legend
  var legend = L.control({position: 'bottomright'});
  legend.onAdd = function(map) {
      var div = L.DomUtil.create('div', 'info legend'),
                  grades = [0, 1, 2, 3, 4, 5],
                  labels = ["0-1", "1-2", "2-3", "3-4", "4-5", "5+"];

      for (var i = 0; i < grades.length; i++) {
          div.innerHTML += '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
          grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      };

      return div;
      legend.addTo(map);

    // limits.forEach(function(limit, index) {
    //   labels.push("<li style=\"background-color: " + colors[index] + "\"></li>");
    // });

    // div.innerHTML += "<ul>" + labels.join("") + "</ul>";
   // return div;
  };
  // Adding legend to the map
 // legend.addTo(myMap);
 // Adds timeline and timeline controls
 var timelineControl = L.timelineSliderControl({
  formatOutput: function(date) {
      return new Date(date).toString();
  }
});
timelineControl.addTo(map);
timelineControl.addTimelines(timelineLayer);
timelineLayer.addTo(map);

}

