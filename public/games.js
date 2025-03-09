console.log('games.js launched');

const gameBinId = '67ce01a8e41b4d34e4a390f4';
const apiKey = '$2a$10$UWl/UsMmB.v6jw7Y1I9zquaKE5OWGPLGu5QBweYdyhZudOt.AJezS';  // Replace with your JSONbin API key

// Fetch game data from JSONbin
const getGamedata = async () => {
    const url = `https://api.jsonbin.io/v3/b/${gameBinId}?meta=false`;

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

    const data = await response.json();

    // Log the fetched data to inspect its structure
    console.log('Fetched Data:', data);

    // Ensure that the 'games' field exists in the response
    if (!data.games) {
        throw new Error('No game data found');
    }

    // Dynamically create list items for each game
    const gamesList = document.querySelector('#games-list'); // Select the UL element where games will be listed
    data.games.forEach(game => {
        const listItem = document.createElement('li');
        listItem.textContent = game.name; // Assuming each game object has a 'name' property
        gamesList.appendChild(listItem);
    });
};

// Call the function to load the games
getGamedata();
