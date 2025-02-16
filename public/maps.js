// maps.js
console.log('maps.js is loaded');

const getJSONData = async () => {
  const binId = '67a8ce85ad19ca34f8fcfee6'; 
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
      console.log("Fetched JSON data:", data);  // Debugging log

      return data;  // Return JSON object, not a string
  } catch (error) {
      console.error("Error fetching JSON data:", error.message);
      return null;
  }
};

        
    const putJSONData = async (updatedData) => {
        const binId = '67a8ce85ad19ca34f8fcfee6'; 
        const apiKey = '$2a$10$UWl/UsMmB.v6jw7Y1I9zquaKE5OWGPLGu5QBweYdyhZudOt.AJezS'; 
        const url = "https://api.jsonbin.io/v3/b/" + binId;
      
        try {
          // Step 1: Update the JSONbin with the modified array
          const response = await fetch(url, {
            method: 'PUT',
            headers: {
              'X-Master-Key': apiKey,
              'Content-Type': 'application/json',
              'X-Bin-Versioning': 'false', // Prevent versioning if necessary
            },
            body: JSON.stringify(updatedData), // Convert back to a JSON string
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
      };
      

      async function getAPIkey() {
        console.log('Fetching API key...');
        try {
            const existingData = await getJSONData();
            console.log('API data fetched:', existingData);
            
            if (Array.isArray(existingData) && existingData.length > 0) {
                const tempkey = existingData[0].api_keys[0].key;
                console.log('API Key:', tempkey);
                return tempkey;
            } else {
                console.error('Invalid JSON structure:', existingData);
                return null;
            }
        } catch (error) {
            console.error('Error fetching API key:', error.message);
        }
    }
    
  async function loadGoogleMapsAPI() {
    const apiKey = await getAPIkey();
    console.log("API Key:", apiKey); // Log the API Key for verification
    if (apiKey) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initialize&v=weekly`;
        script.defer = true;
        script.onerror = (error) => {
            console.error('Error loading Google Maps API:', error);
        };
        document.head.appendChild(script);
    } else {
        console.error('API key is undefined');
    }
}

  
  // Call the function to load Google Maps API

  
function initialize() {
    const fenway = { lat: 42.345573, lng: -71.098326 };


    const panorama = new google.maps.StreetViewPanorama(
        document.getElementById("pano"),
        {
            position: fenway,
            pov: { heading: 34, pitch: 10 },
        }
    );

    map.setStreetView(panorama);
}
window.initialize = initialize;
