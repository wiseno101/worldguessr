console.log('maps.js launched'); // console log for maps.js being loaded to the website
let map; //global variable for map
let markers = {}; // global object for markers
let markersData = []; //global array for markerData; ie coordinates of guess
let round = 0; // change to round counter when that woreksa
let hasGuessed = null;
//event listener to ensure DOM loads all HTML before executing js code
window.addEventListener('DOMContentLoaded', (event) => {
  console.log('DOM fully loaded and parsed'); 

  // Add event listeners for the modal buttons after the DOM is fully loaded

 document.getElementById('openModalButton').addEventListener('click', openMapModal);
 
//refresh googlemapsAPI when modal is closed
 document.querySelector('.close').addEventListener('click', closeMapModal);

  loadGoogleMapsAPI(); 
});

// Fetch API key from JSONbin
async function getAPIkey() {
  console.log('Fetching API key...');
  try {
      const existingData = await getJSONData();
      console.log('API data fetched:', existingData);

//ensure apikey is recieved
      if (existingData && existingData.api_keys && existingData.api_keys.length > 0) {
          const tempKey = existingData.api_keys[0].key;
          console.log('API Key:', tempKey);
          return tempKey;
      } else { // error handling for incorect JSONbin connection
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

const getSelectedGame = async () => {
    const response = await fetch('/get-selected-game');
    if (response.ok) {
        const data = await response.json();
        console.log('getSelectedGame in maps,js', data)
        return data;
    }
    throw new Error('Game data not found');
};


// Initialize the Google Map
async function initMap() {
    try {
        const selectedGame = await getSelectedGame(); // Wait for selectedGame data
        if (!selectedGame) {
      alert('No game data available');
      return;
    }

    const game_pos = { lat: selectedGame.game_data[round].coordinates.lat, lng: selectedGame.game_data[round].coordinates.lng};
    map = new google.maps.Map(document.getElementById('map'), {
      center: { lat: 0, lng: 0 },
      zoom: 1,
      streetViewControl: false
    });
  
    const panorama = new google.maps.StreetViewPanorama(document.getElementById("pano"), {
      position: game_pos,
      pov: { heading: 34, pitch: 10 },
      disableDefaultUI: true,
      
    });
  console.log('streetview loaded witrh these coords', game_pos)
    map.setStreetView(panorama);

  
    map.addListener('click', function (event) {
      if (hasGuessed) {
        alert("You have already made your guess!");
        return;
      }
      hasGuessed = true;
      addMarker(event.latLng, 'New Marker', `Coordinates: ${event.latLng.lat()}, ${event.latLng.lng()}`);
    });
    } catch (error) {
    console.error('Error initializing map:', error);
    }
  };
  
  // Add a marker to the map; need to make only work for one markee
function addMarker(location, title, content) {
    var order = markersData.length; // Assign the next sequential order
    
    // Add marker information to the array FIRST; need to make write to global variable for scoring when submit is pressed
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
    
    // Delete a marker,
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
      hasGuessed = null;
    }

// Fetch JSON data from JSONbin function from Professor Toporski
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

// Update JSONbin data function from professor toporski
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
