import './style.css'
import geojson from './public/maps/nola-neighborhoods.json'
import mapboxgl from 'mapbox-gl';
import center from '@turf/center'

//add the map
document.querySelector('#app').innerHTML = `
  <div>
    <div id="message-area">Welcome. Zoom in far enough and 3D buildings appear. Click a neighborhood for more.</div>
    <div id="map"></div>
  </div>
`

// TO MAKE THE MAP APPEAR YOU MUST
// ADD YOUR ACCESS TOKEN FROM
// https://account.mapbox.com
mapboxgl.accessToken = 'pk.eyJ1IjoiY29keTEyMTMiLCJhIjoiY2swZWNxNTFlMDB4NjNnbzJ4dThuM3N1aSJ9.t-BPpRXIIYD_B36Eapxikw';
const map = new mapboxgl.Map({
  style: 'mapbox://styles/mapbox/light-v10',
  center: [-90.08, 29.95],
  zoom: 15.5,
  pitch: 35,
  bearing: -17.6,
  container: 'map',
  antialias: true
});

map.on('load', () => {
  // Insert the layer beneath any symbol layer.
  const layers = map.getStyle().layers;
  const labelLayerId = layers.find(
    (layer) => layer.type === 'symbol' && layer.layout['text-field']
  ).id;

  // The 'building' layer in the Mapbox Streets
  // vector tileset contains building height data
  // from OpenStreetMap.
  map.addLayer({
      'id': 'add-3d-buildings',
      'source': 'composite',
      'source-layer': 'building',
      'filter': ['==', 'extrude', 'true'],
      'type': 'fill-extrusion',
      'minzoom': 15,
      'paint': {
        'fill-extrusion-color': '#aaa',

        // Use an 'interpolate' expression to
        // add a smooth transition effect to
        // the buildings as the user zooms in.
        'fill-extrusion-height': [
          'interpolate',
          ['linear'],
          ['zoom'],
          15,
          0,
          15.05,
          ['get', 'height']
        ],
        'fill-extrusion-base': [
          'interpolate',
          ['linear'],
          ['zoom'],
          15,
          0,
          15.05,
          ['get', 'min_height']
        ],
        'fill-extrusion-opacity': 0.6
      }
    },
    labelLayerId
  );

  function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  geojson.features.forEach(f => {
    f.properties.color = getRandomColor();
  })

  map.addSource('nola-neighborhoods', {
    type: 'geojson',
    // Use a URL for the value for the `data` property.
    data: geojson
  });

  map.addLayer({
    'id': 'neighborhood-boundaries',
    'type': 'symbol',
    'source': 'nola-neighborhoods',
    'type': 'fill',
    'layout': {},
    'paint': {
      'fill-color': ['get', 'color'],
      'fill-opacity': 0.2
    }
  });

  map.addLayer({
    'id': 'outline',
    'type': 'line',
    'source': 'nola-neighborhoods',
    'layout': {},
    'paint': {
      'line-color': '#000',
      'line-width': 3
    }
  });

  const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
  });

  let nbhd;
  map.on('click', 'neighborhood-boundaries', (e) => {
    const description = e.features[0].properties.NBHD_NAME;
    const area = e.features[0].properties.Area;
    const pdist = e.features[0].properties.pdist_no;
    let messageArea = document.querySelector('#message-area');
    messageArea.innerHTML = 'This is ' + description + ', in Planning District ' + pdist +'. It has an area of '+ area + ' mi<sup>2</sup>.' 
    // if (nbhd != description) {
    //   nbhd = description;
    //   // Change the cursor style as a UI indicator.
    //   map.getCanvas().style.cursor = 'pointer';

    //   const coordinates = e.features[0].geometry.coordinates[0][0];

    //   // Ensure that if the map is zoomed out such that multiple
    //   // copies of the feature are visible, the popup appears
    //   // over the copy being pointed to.
    //   while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
    //     coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    //   }

    //   // Populate the popup and set its coordinates
    //   // based on the feature found.
    //   popup.setLngLat(coordinates).setHTML(description).addTo(map);
    // }
  });

});