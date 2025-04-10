console.log('maps.js launched'); // console log for maps.js being loaded to the website
let map; //global variable for map
let markers = {}; // global object for markers
let markersData = []; //global array for markerData; ie coordinates of guess
let round = 0; // roundcounter
let totalRounds = 5;
let totalscore = 0;
let hasGuessed = null;
let guessPosition = null; // Stores the guessed position
let actualPosition = null; // Stores the actual game position
let hint = null;
let lol = null;
//event listener to ensure DOM loads all HTML before executing js code
window.addEventListener('DOMContentLoaded', (event) => {
  console.log('DOM fully loaded and parsed'); 

  // Add event listeners for the modal button + hint button after the DOM is fully loaded

 document.getElementById('openModalButton').addEventListener('click', openMapModal);
 document.getElementById('hintButton').addEventListener('click', drawHintCircle);

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
      const selectedGame = await getSelectedGame();
      if (!selectedGame || !selectedGame.game_data[round]) {
          alert('No game data available for this round');
          return;
      }

      // Load the actual coordinates for the round
      actualPosition = { 
          lat: selectedGame.game_data[round].coordinates.lat, 
          lng: selectedGame.game_data[round].coordinates.lng 
      };

      // Initialize Map
      map = new google.maps.Map(document.getElementById('map'), {
          center: { lat: 0, lng: 0 },
          zoom: 1,
          streetViewControl: false
      });

      // Initialize Street View
      const panorama = new google.maps.StreetViewPanorama(document.getElementById("pano"), {
          position: actualPosition,
          pov: { heading: 34, pitch: 10 },
          disableDefaultUI: true,
          showRoadLabels: false
      });
      map.setStreetView(panorama);

      console.log(`Round ${round + 1} loaded with coordinates`, actualPosition);

      // Allow user to place a single guess marker
      hasGuessed = false;
      guessPosition = null;
      
      map.addListener('click', function (event) {
          if (hasGuessed) {
              alert("You have already made your guess!");
              return;
          }
          hasGuessed = true;
          guessPosition = {
              lat: event.latLng.lat(),
              lng: event.latLng.lng(),
          };
          addMarker(event.latLng, 'Your Guess', `Coordinates: ${event.latLng.lat()}, ${event.latLng.lng()}`);
      });

      // Submit guess and calculate score
      document.getElementById("submitGuess").addEventListener("click", function () {
        if (!guessPosition) {
            return;
        }
        if (!actualPosition) {
            alert("Actual game coordinates not loaded!");
            return;
        }
    
        // Calculate score
        const score = calculateScore(guessPosition, actualPosition);
        totalscore = totalscore + score;
        console.log("Calculated score:", score);
        console.log("Total score:", totalscore);
    
        // Proceed to next round
        if (round < totalRounds - 1) {
            round++; // Move to next round
            hasGuessed = false;
            guessPosition = null;
            actualPosition = null;
            deleteMarker(1);
    
            initMap(); // Reload the map for the next round
        } else {
            console.log("Total score before submitting:", totalscore);
            postscore(totalscore);
            return;
        }
    });

     //Enable the Hint button at start of each round
     hintButton.disabled = false;
     hintButton.style.opacity = "1";
     hintButton.innerText = "Hint";
     hint = null;

      // Update round display
      document.getElementById("roundDisplay").innerText = `Round: ${round + 1} / ${totalRounds}`;
      document.getElementById("totalscore").innerText = `Total Score: ${totalscore}`;



  } catch (error) {
      console.error('Error initializing map:', error);
  }
}

  
  // Add a marker to the map; need to make only work for one markee
function addMarker(location, title, content) {
    var order = 1; // Assign the next sequential order
    
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
  }

    
    // Delete a marker,
    function deleteMarker(order) {
    
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
//Hint Circle
function drawHintCircle() {
    if (!map || !actualPosition) {
        alert("Map or actual position not initialized.");
        return;
    }
    //disables the button when clicked & changes opacity and text
    hintButton.disabled = true;
    hintButton.style.opacity = "0.5";
    hintButton.innerText = "Hint Used";
    hint = true;
    // Set radius of circle to 2500km
    const radiusInKm = 100;
    const radiusInMeters = radiusInKm * 1000;

    // Convert radius to degrees (approximate: 1 deg = 111km)
    const radiusInDegrees = radiusInKm / 111;

    // Generate a random angle and distance to offset the circle center
    const randomAngle = Math.random() * 2 * Math.PI;
    const randomDistance = Math.random() * radiusInDegrees;

    // Offset the circle center from the actual location
    const offsetLat = actualPosition.lat + (randomDistance * Math.cos(randomAngle));
    const offsetLng = actualPosition.lng + (randomDistance * Math.sin(randomAngle)) / Math.cos(actualPosition.lat * Math.PI / 180);


    // Draw the circle
    new google.maps.Circle({
        strokeColor: '#FF0000',
        strokeOpacity: 0.7,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.15,
        map,
        center: { lat: offsetLat, lng: offsetLng },
        radius: radiusInMeters,
        clickable: false
    });

    console.log(`Hint circle drawn with radius ${radiusInKm} km`);

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

// calculate score function
function calculateScore(guess, actual) {
    lol = null;
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(actual.lat - guess.lat);
  const dLng = toRad(actual.lng - guess.lng);
  
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(guess.lat)) * Math.cos(toRad(actual.lat)) * Math.sin(dLng / 2) ** 2;
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  
  console.log(`Calculated Distance: ${distance} km`); // Debugging
    // exponential version return Math.max(0, Math.round(5000 * Math.exp(-distance / 200)));


    if (hint){
        lol = (Math.max(0, Math.round(5000 - distance * 100)))/2;
        document.getElementById("scoreDisplay").innerText = `Previous Round Score(Halved because of Hint): ${lol} | Previous Round Distance ${distance.toFixed(2)} Km`;

    } else {
        lol = Math.max(0, Math.round(5000 - distance * 100));
        document.getElementById("scoreDisplay").innerText = `Previous Round Score: ${lol} | Previous Round Distance ${distance.toFixed(2)} Km`;

    }
        return (lol);

}

const postscore = async (totalscore) => {
            // Check if the total score is a valid number
    if (typeof totalscore !== 'number') {
        console.error("Invalid total score:", totalscore);
        return;
    }
   const score = JSON.rawJSON(totalscore);
    try {
        fetch('/maps', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ score: totalscore })
          })
          .then(res => res.json())
          .then(data => {
            if (data.redirect) {
              window.location.href = data.redirect; // Now the browser will go to /scores
            }
          });
          
    } catch (error) {
        console.error("Error uploading scores:", error);
    }
};
/*         const scores = document.querySelector('#scores')
        score => {
            const form = document.createElement('form');
            form.action = '/maps';
            form.method = 'POST';
            form.innerHTML = `
                <input type="hidden" name="totalscore" value="${totalscore}">
            `;
            scores.appendChild(form);
        }
        */
