console.log('maps.js launched');
let map;
let markers = {};
let markersData = []; 

window.addEventListener('DOMContentLoaded', (event) => {
  console.log('DOM fully loaded and parsed');

  // Add event listeners for the modal buttons after the DOM is fully loaded
  document.getElementById('openModalButton').addEventListener('click', openMapModal);
  document.querySelector('.close').addEventListener('click', closeMapModal);

  loadGoogleMapsAPI();
});

// Fetch API key from JSONbin
async function getAPIkey() {
  console.log('Fetching API key...');
  try {
      const existingData = await getJSONData();
      console.log('API data fetched:', existingData);

      if (existingData && existingData.api_keys && existingData.api_keys.length > 0) {
          const tempKey = existingData.api_keys[0].key;
          console.log('API Key:', tempKey);
          return tempKey;
      } else {
          console.error('Invalid JSON structure:', existingData);
          return null;
      }
  } catch (error) {
      console.error('Error fetching API key:', error.message);
      return null;
  }
}

// Load Google Maps API dynamically
async function loadGoogleMapsAPI() {
  const apiKey = await getAPIkey();
  if (apiKey) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&callback=initMap`;
      script.async = true;  // Ensures asynchronous loading
      script.defer = true;  // Ensures the script is executed after the page has been parsed
      script.onload = function () {
          console.log('Google Maps API loaded successfully');
      };
      script.onerror = function (error) {
          console.error('Error loading script:', error);
          alert('Failed to load the map API. Please try again later.');
      };
      document.head.appendChild(script);
  } else {
      console.error('API key is undefined');
  }
}

// Initialize the Google Map
function initMap() {
  console.log('Initializing Google Map...');
  
  try {
      // Ensure the #map element exists before initializing the map
      const mapElement = document.getElementById('map');
      if (!mapElement) {
          throw new Error('Map element not found');
      }

      map = new google.maps.Map(mapElement, {
          center: { lat: 0, lng: 0 },
          zoom: 12,
          streetViewControl: false
      });

      console.log('Google Map initialized successfully');

      // Try HTML5 geolocation
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
              function (position) {
                  let pos = { lat: position.coords.latitude, lng: position.coords.longitude };

                  if (nocenter === 1) {
                      map.setCenter(pos);
                      nocenter = 0;
                  }

                  addMarker(pos, 'Your Location', `Current Coordinates: ${pos.lat}, ${pos.lng}`);
              },
              function (error) {
                  console.warn("Geolocation failed:", error);
                  alert("Could not get location. Please enable GPS or try again.");
              }
          );
      }

      // Click event listener for adding markers
      map.addListener('click', function (event) {
          addMarker(event.latLng, 'New Marker', `Coordinates: ${event.latLng.lat()}, ${event.latLng.lng()}`);
      });

      // Initialize Street View
      const game_pos = { lat: 39.395370, lng: -75.038460 };
      const panorama = new google.maps.StreetViewPanorama(
          document.getElementById("pano"),
          {
              position: game_pos,
              pov: { heading: 34, pitch: 10 },
              disableDefaultUI: true,
          }
      );

      map.setStreetView(panorama);

  } catch (error) {
      console.error('Error initializing Google Map:', error);
  }
}

// Add a marker to the map
function addMarker(location, title, content) {
var order = markersData.length; // Assign the next sequential order

// Add marker information to the array FIRST
markersData.push({ order: order, coordinates: { lat: location.lat(), lng: location.lng() } });

// Now create the marker
var marker = new google.maps.Marker({
  position: location,
  map: map,
  title: title
});

markers[order] = marker; // Store marker reference

var infowindow = new google.maps.InfoWindow({
  content: `<div>
            <p>${content}</p>
            <button id="deleteMarkerButton${order}">Delete</button>
          </div>`
});

marker.addListener('click', function () {
  infowindow.open(map, marker);
  document.getElementById(`deleteMarkerButton${order}`).addEventListener('click', function () {
    deleteMarker(order);
  });
});

// Show updated JSON **AFTER** the new marker is added
setTimeout(() => {
  alert("Updated Markers (After Adding New Marker):\n" + JSON.stringify(markersData, null, 2));
}, 100);
}

// Delete a marker
function deleteMarker(order) {
  alert("Current Markers (Before Deletion):\n" + JSON.stringify(markersData, null, 2));

  // Remove marker from the map
  if (markers[order]) {
      markers[order].setMap(null);
      delete markers[order];
  }

  // Remove marker from array
  markersData = markersData.filter(marker => marker.order !== order);

  // Reassign orders sequentially
  markersData.forEach((marker, index) => {
      marker.order = index;
  });

  // Rebuild markers object
  let updatedMarkers = {};
  markersData.forEach((marker, index) => {
      updatedMarkers[index] = markers[index];
  });
  markers = updatedMarkers;

  alert("Updated Markers (After Deletion):\n" + JSON.stringify(markersData, null, 2));
}

// Fetch JSON data from JSONbin
async function getJSONData() {
  const binId = '67bde89dad19ca34f811c459';
  const apiKey = '$2a$10$UWl/UsMmB.v6jw7Y1I9zquaKE5OWGPLGu5QBweYdyhZudOt.AJezS';
  const url = `https://api.jsonbin.io/v3/b/${binId}?meta=false`;

  try {
      const response = await fetch(url, {
          method: 'GET',
          headers: {
              'X-Master-Key': apiKey,
              'Content-Type': 'application/json'
          }
      });

      if (response.status !== 200) {
          throw new Error("Cannot fetch data");
      }

      let data = await response.json();
      console.log("Fetched JSON data:", data);
      return data;
  } catch (error) {
      console.error("Error fetching JSON data:", error.message);
      return null;
  }
}

// Update JSONbin data
async function putJSONData(updatedData) {
  const binId = '67bde89dad19ca34f811c459';
  const apiKey = '$2a$10$UWl/UsMmB.v6jw7Y1I9zquaKE5OWGPLGu5QBweYdyhZudOt.AJezS';
  const url = `https://api.jsonbin.io/v3/b/${binId}`;

  try {
      const response = await fetch(url, {
          method: 'PUT',
          headers: {
              'X-Master-Key': apiKey,
              'Content-Type': 'application/json',
              'X-Bin-Versioning': 'false',
          },
          body: JSON.stringify(updatedData),
      });

      if (response.status !== 200) {
          throw new Error('Failed to update data');
      }

      alert('Data successfully updated');
      return await response.json();
  } catch (error) {
      console.error('Error:', error.message);
      throw error;
  }
}

// Open map modal in the bottom-right corner
function openMapModal() {
document.getElementById('mapModal').style.display = 'block';
document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
}

// Close map modal
function closeMapModal() {
document.getElementById('mapModal').style.display = 'none';
document.body.style.overflow = 'auto'; // Re-enable scrolling when modal is closed
}
