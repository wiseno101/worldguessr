// games.js

// Fetch and display the games
const getGameData = async () => {
    try {
        const response = await fetch('/get-selected-game');
        const data = await response.json();
        const gamesList = document.querySelector('#games-list');
        data.games.forEach(game => {
            const form = document.createElement('form');
            form.action = '/maps';
            form.method = 'POST';
            form.innerHTML = `
                <input type="hidden" name="gameId" value="${game._id}">
                <button type="submit">${game._id}: ${game.description}</button>
            `;
            gamesList.appendChild(form);
        });
    } catch (error) {
        console.error("Error fetching games:", error);
    }
};

// When the game is selected, save it to localStorage
const selectGame = (gameId) => {
    localStorage.setItem('selectedGame', JSON.stringify(gameId));
    window.location.href = "/maps";  // Navigate to maps page
};

// Call getGameData to load games
getGameData();
