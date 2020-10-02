
function success(position) {
  const latitude  = position.coords.latitude;
  const longitude = position.coords.longitude;

  //Base Layer with Open Street Maps
  var baseMapLayer = new ol.layer.Tile({
    source: new ol.source.OSM()
  });
  //Construct the Map Object
  var map = new ol.Map({
    target: 'map',
    layers: [ baseMapLayer],
    view: new ol.View({
            center: ol.proj.fromLonLat([longitude, latitude]),
            zoom: 15 //Initial Zoom Level
          })
  });
  //Set up an  Style for the marker note the image used for marker
  var iconStyle = new ol.style.Style({
      image: new ol.style.Icon(/** @type {module:ol/style/Icon~Options} */ ({
        anchor: [0.5, 0.5],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        src: 'image/icon.png'
      }))
  });
  //Adding a marker on the map
  var marker = new ol.Feature({
    geometry: new ol.geom.Point(
      ol.proj.fromLonLat([longitude, latitude])
    )
  });
  marker.setStyle(iconStyle);
  var vectorSource = new ol.source.Vector({
    features: [marker]
  });
  var markerVectorLayer = new ol.layer.Vector({
    source: vectorSource,
  });
  // add style to Vector layer style map
  map.addLayer(markerVectorLayer);
}

function error() {
  console.log('Unable to retrieve your location');
}

if(!navigator.geolocation) {
  console.log('Geolocation is not supported by your browser');
} else {
  console.log('Locating…');
  navigator.geolocation.getCurrentPosition(success, error);
}

