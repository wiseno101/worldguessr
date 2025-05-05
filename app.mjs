/*
WORLD GUESSER PROJECT
Senior Computing and Informatics Capstone

Lead Developer: Noah Wise

Lead HTML and CSS : Nisargsinh Vaghela

Mid-Level Developers:
-Rad Pena
-Hunter Rolph
-Kyle Ernst

Description:
World guessing game that is developed in JavaScript
Server is run on localport:1234 using a local express server
JSONbin is used for the DB and consists of two Bins
Pug and HTML are used for the markup language

*/

import express from 'express'; // Import express module to run local server
import http from 'http';  // Import 'http' module
import qString from 'querystring';  // Import 'querystring' module
import bodyParser from 'body-parser'; // middleware for parsing bodys of info
import session from 'express-session'; // session middleware that allows for express sessions
import crypto from 'crypto'; // for simple encryption 'genHash' of passwords
import e from 'express';

const app = express(); //assigns 'app' to express server

// JSONbin API Details
const binId = '67bde89dad19ca34f811c459';  // JSONbin ID for userID and api
/* topography of user/api jsonbin:

{
  "users": [
    {
      "_id": "lala",
      "username": "lala",
      "email": "lala@gmail.com",
      "password": "HashedPassword",
      "games": [
        {
          "game_id": "game1",
          "score": "1000"
        }
      ]
    }
  ],
  "api_keys": [
    {
      "website": "Google Maps",
      "key": "APIkey"
    }
  ]
}

*/
const gameBinId = '67ce01a8e41b4d34e4a390f4'; //JSONbin ID for games
/* topography of games jsonbin
{
  "games": [
    {
      "_id": "NJ_1",
      "description": "This is NJ one",
      "game_data": [
        {
          "round": "1",
          "coordinates": {
            "lat": 0,
            "lng": 0
          },
          "hints": {
            "hints_flag": "flag.png"
          }
        },
        {
          "round": "2",
          "coordinates": {
            "lat": 0,
            "lng": 0
          },
          "hints": {
            "hints_flag": "flag.png"
          }
        },
        {
          "round": "3",
          "coordinates": {
            "lat": 0,
            "lng": 0
          },
          "hints": {
            "hints_flag": "flag.png"
          }
        },
        {
          "round": "4",
          "coordinates": {
            "lat": 0,
            "lng": 0
          },
          "hints": {
            "hints_flag": "flag.png"
          }
        },
        {
          "round": "5",
          "coordinates": {
            "lat": 0,
            "lng": 0
          },
          "hints": {
            "hints_flag": "flag.png"
          }
        }
      ]
    }
  ]
}

*/
const apiKey = '$2a$10$UWl/UsMmB.v6jw7Y1I9zquaKE5OWGPLGu5QBweYdyhZudOt.AJezS';  //JSONbin API key

//game logic vars




app.set('views', './views'); // sets views directory for express app
app.set('view engine', 'pug'); // sets the view engine for the express server to pug(can serve pug and html mixed)
app.use(express.static('public')); // sets the static folder to 'public'; needed to call files in html and js
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false })); // Middleware to parse the body

// this assigns the CSP header; this is used for the express server which needs apis allowed in order to speak with jsonbin and googlemapsapi
app.use((req, res, next) => {
  res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; " +
      "script-src 'self' https://maps.googleapis.com https://cdn.jsdelivr.net; " +
      "script-src-elem 'self' https://maps.googleapis.com https://cdn.jsdelivr.net; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "img-src 'self' data: https://maps.gstatic.com https://maps.googleapis.com https://streetviewpixels-pa.googleapis.com https://lh3.ggpht.com; " +
      "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net; " +
      "connect-src 'self' https://api.jsonbin.io https://maps.googleapis.com;"
  );
  next();
});



//start express server on localhost:1234
app.listen(1234, async () => {
    console.log("Server is running..."); //runs if server is running successfully
});

// Session middleware
app.use(session({
    secret: 'shhhhh',
    saveUninitialized: false,
    resave: false
}));

// Routes

//landingpage
app.get('/', (req, res) => {
    res.render('index');
});

//loginpage get
app.get('/login', (req, res) => {
    res.render('login');
    console.log("Accessing login page");
});

//registerpage get
app.get('/register', (req, res) => {
    console.log("Accessing register page");
    res.render('register');
});

//homepage get
app.get('/home', (req, res) => {
	//function to verify user is logged in
    if (!req.session.user) {
        console.log('Unable to access');
        res.redirect('/login');
    } else {
        console.log("Accessing home page");
        res.render('home');
    }
});

//about page get
app.get('/about', (req, res) => {
	//function to verify user is logged in
    if (!req.session.user) {
        console.log('Unable to access');
        res.redirect('/login');
    } else {
        console.log("Accessing about page");
        res.render('about');
    }
});

//settings get
app.get('/settings', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.render('settings');
});

// Maps route: Retrieve selected game from the session
app.get('/maps', (req, res) => {
  const selectedGame = req.session.selectedGame;
  if (!selectedGame) {
    return res.status(400).send("No game selected /maps in app.mjs");
  } else {
    res.render('maps', { selectedGame });
  };


});

//create page get
app.get('/create', (req, res) => {
  //function to verify user is logged in
  if (!req.session.user) {
      console.log('Unable to access');
      res.redirect('/login');
  } else {
      console.log("Accessing create");
      res.render('create');
  }
});

//games loading, with data from jsonbin
app.get('/games', async (req, res) => {
  try {
      const response = await fetch(`https://api.jsonbin.io/v3/b/${gameBinId}?meta=false`, {
          method: 'GET',
          headers: { 'X-Master-Key': apiKey, 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      res.render('games', { games: data.games });
  } catch (error) {
      console.error("Error fetching game data:", error);
      res.status(500).send("Error fetching games");
  }
});

//scores get
app.get('/scores', (req, res) => {
	//function to verify user is logged in
    if (!req.session.user) {
      console.log('Unable to access');
res.redirect('/login');
    } else {
      const selectedGame = req.session.selectedGame;
      const score = req.session.score;
      if (!selectedGame) {
        return res.status(400).send("No game selected /scores in app.mjs");
      } else {
        console.log(req.session.score);
        res.render('scores', { selectedGame, score });
      };
    }
});

// get route to assist maps.js to get the selected
app.get('/get-selected-game', (req, res) => {
  // Retrieve the selected game from the session or a global variable
  if (!req.session.selectedGame) {
      return res.status(404).json({ error: 'No game selected' });
  }
  console.log('get-selected-game:',req.session.selectedGame);
  res.json(req.session.selectedGame);
});

//logout  page get
app.get('/logout', (req, res) => {
  //function to verify user is logged in
  if (!req.session.user) {
      console.log('Unable to access');
      res.redirect('/login');
  } else {
      console.log("Accessing logout");
      res.render('logout');
  }
});

//leaderboard get
app.get('/leaderboard', async (req, res) => {
  try {
    const gameData = await getGameData();
    res.render('leaderboard', { games: gameData.games });
  } catch (err) {
    console.error('Error fetching leaderboard data:', err);
    res.status(500).send('Failed to load leaderboard');
  }
});

//settings post
app.post('/settings', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  const { current, new: newPassword } = req.body;
  const username = req.session.user.username;

  try {
    const data = await getJSONData();
    const user = data.users.find(u => u._id === username);

    if (!user || genHash(current) !== user.password) {
      return res.render('settings', { msg: "Incorrect current password." });
    }

    user.password = genHash(newPassword);
    await putJSONData(data);

    res.render('settings', { msg: "Password successfully changed!" });
  } catch (err) {
    console.error(err);
    res.render('settings', { msg: "Error updating password." });
  }
});


//logout post
app.post('/logout', (req, res) => {

  req.session.user = null;
  res.redirect('/');

});
//post for saving game score
app.post('/scores', express.urlencoded({ extended: false }), async (req, res) => {
  try {
    const final_score = parseInt(req.body.score);
    const gameId = req.body.gameId;

    const userData = await getJSONData();
    const gameData = await getGameData();

    const username = req.session.user.username;

    const user = userData.users.find(u => u._id === username);
    const game = gameData.games.find(g => g._id === gameId);

    // Handle user scores
    const userGame = user.games.find(g => g.game_id === gameId);
    if (userGame) {
      if (parseInt(userGame.score) < final_score) {
        userGame.score = final_score.toString(); // Update user's score
      }
    } else {
      user.games.push({ game_id: gameId, score: final_score.toString() }); // New game score for user
    }

    // Handle game scores
    if (!game.scores) {
      game.scores = []; // Make sure the scores array exists
    }

    const gameUserScore = game.scores.find(s => s.user === username);
    if (gameUserScore) {
      if (parseInt(gameUserScore.score) < final_score) {
        gameUserScore.score = final_score.toString(); // Update score if it's higher
      } else {
        console.log('bro did worse');

      }

    } else {
      game.scores.push({ user: username, score: final_score.toString() }); // Add new score entry
    }

    // Save both updates
    await putJSONData(userData);
    await putGameData(gameData);

    // Clean up session
    req.session.score = null;
    req.session.selectedGame = null;

    res.redirect('/games');
  } catch (err) {
    console.error(err);
    res.render('scores', { msg: "Error registering scores" });
  }
});

//create level post
app.post('/create', express.urlencoded({ extended: false }), async (req, res) => {
    try {
        // Check for missing fields
        if (!req.body._id || !req.body.description || !req.body.round1_lat || !req.body.round1_lng ||
          !req.body.round2_lat || !req.body.round2_lng || !req.body.round3_lat || !req.body.round3_lng ||
          !req.body.round4_lat || !req.body.round4_lng || !req.body.round5_lat || !req.body.round5_lng) {
          return res.render('create', {
              msg: "All fields are required.",
              _id: req.body._id,
              description: req.body.description,
              round1_lat: req.body.round1_lat,
              round1_lng: req.body.round1_lng,
              round2_lat: req.body.round2_lat,
              round2_lng: req.body.round2_lng,
              round3_lat: req.body.round3_lat,
              round3_lng: req.body.round3_lng,
              round4_lat: req.body.round4_lat,
              round4_lng: req.body.round4_lng,
              round5_lat: req.body.round5_lat,
              round5_lng: req.body.round5_lng
          });
      }
		//create new user using userclass
    const newGame = {
      _id: req.body._id,
      description: req.body.description,
      scores: [
        {
          "user": null,
          "score": null
        }
      ],
      game_data: [
        {
          round: "1",
          coordinates: {
            lat: parseFloat(req.body.round1_lat),  // Convert to float
            lng: parseFloat(req.body.round1_lng)   // Convert to float
          }
        },
        {
          round: "2",
          coordinates: {
            lat: parseFloat(req.body.round2_lat),
            lng: parseFloat(req.body.round2_lng)
          }
        },
        {
          round: "3",
          coordinates: {
            lat: parseFloat(req.body.round3_lat),
            lng: parseFloat(req.body.round3_lng)
          }
        },
        {
          round: "4",
          coordinates: {
            lat: parseFloat(req.body.round4_lat),
            lng: parseFloat(req.body.round4_lng)
          }
        },
        {
          round: "5",
          coordinates: {
            lat: parseFloat(req.body.round5_lat),
            lng: parseFloat(req.body.round5_lng)
          }
        }
      ]
  };


        // Get current data from JSONbin
        const data = await getGameData();

        // Check if the username already exists; resets page if so
        if (data.games.find(game => game._id === req.body._id)) {
            return res.render('create', { msg: "Game already exists" });
        }

        // Add the new user to the users array
        data.games.push(newGame);

        // Update JSONbin with the new data
        await putGameData(data);

		//redirect to home page
        res.redirect('home');
    } catch (err) { // error handling
        console.error(err);
        res.render('create', { msg: "Error creating game" });
    }
});
//post route to assist game select
app.post('/select-game', async (req, res) => {
  const { gameId } = req.body;
  try {
      const gameData = await getGameData();
      const selectedGame = gameData.games.find(game => game._id === gameId);

      if (!selectedGame) {
          return res.status(404).send({ error: 'Game not found' });
      }

      // Store the selected game in the session
      req.session.selectedGame = selectedGame;  // Store selected game in session
      console.log('select-game selection: ', selectedGame)
      res.redirect('/maps');
  } catch (error) {
      console.error('Error selecting game:', error);
      res.status(500).send('Error selecting game');
  }
});

//submit score post
app.post('/maps', (req, res) => {
    const  score  = req.body.score;

    if(!req.session.score){
    console.log('Received score:', score); // Log the received score
      req.session.score = score;
      res.json({ redirect: '/scores' });
} else {
  console.log('lol');
}

});

//registerpage post
app.post('/register', express.urlencoded({ extended: false }), async (req, res) => {
    try {
        // Check for missing fields
        // Check for missing fields
        if (!req.body.uname || !req.body.pword || !req.body.email) {
          return res.render('register', {
              msg: "All fields are required.",
              uname: req.body.uname,
              email: req.body.email
          });
      }  
		//create new user using userclass
        const newUser = {
            _id: req.body.uname,
            username: req.body.uname,
            email: req.body.email,
            password: genHash(req.body.pword), // Hash the password
            games: [
              {
                game_id: null,
                score: null
              }
            ]
        };

        // Get current data from JSONbin
        const data = await getJSONData();

        // Check if the username already exists; resets page if so
        if (data.users.find(user => user._id === req.body.uname)) {
            return res.render('register', { msg: "Username already exists" });
        }

        // Add the new user to the users array
        data.users.push(newUser);

        // Update JSONbin with the new data
        await putJSONData(data);

		//redirect to login page
        res.redirect('login');
    } catch (err) { // error handling
        console.error(err);
        res.render('register', { msg: "Error registering user" });
    }
});

//loginpage post
app.post('/login', express.urlencoded({ extended: false }), async (req, res) => {
    try {
		//untrusted object for storing given username and password
        const untrusted = { user: req.body.uname, password: req.body.pword };

        // Get the current user data
        const data = await getJSONData();

        // Find the user by username
        const user = data.users.find(u => u._id === req.body.uname);

        // If user exists, compare hashed password
        if (user && genHash(untrusted.password) === user.password) {
            req.session.user = { username: user.username }; // give session a value 'user' which sets its boolean to true, allowing access to locked pages
            console.log("User session made");
            res.redirect('/home');
        } else { //redirect back to login with incorrect password msg
            console.log("User session not made");
            res.render('login', { msg: "Incorrect Password" });
        }
    } catch (err) { //error handling
        console.error(err);
        res.redirect('/login');
    }
});


app.use('*', (req, res) => { // error handling for a 404 error
    res.writeHead(404);
    res.end(`<h1> ERROR 404. ${req.url} NOT FOUND</h1><br><br>`);
});

app.use((err, req, res, next) => { // errror handling for when a page cannot load correctly
    res.status(500).render('error', { message: err.message });
});



// Helper function to hash passwords; uses crypto library to generate a SHA256 hash
function genHash(input){
  return Buffer.from(crypto.createHash('sha256').update(input).digest('base32')).toString('hex').toUpperCase();
}

// Fetch user data from JSONbin; function from Professor Toporski
const getJSONData = async () => {
  const url = `https://api.jsonbin.io/v3/b/${binId}?meta=false`;

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

  // Ensure that the 'users' field exists in the response
  if (!data.users) {
      throw new Error('No users data found');
  }

  return data;  // Directly return the data without expecting a 'record' field
};




// Put updated data back to JSONbin; function from Professor Toporski
const putJSONData = async (updatedData) => {
  const url = `https://api.jsonbin.io/v3/b/${binId}`;

  const response = await fetch(url, {
      method: 'PUT',
      headers: {
          'X-Master-Key': apiKey,
          'Content-Type': 'application/json',
          'X-Bin-Versioning': 'false'
      },
      body: JSON.stringify(updatedData) // Convert data back to JSON string
  });

  if (response.status !== 200) {
      throw new Error('Failed to update data');
  }

  return await response.json();
};

// Put updated data back to JSONbin; function from Professor Toporski
const putGameData = async (updatedData) => {
  const url = `https://api.jsonbin.io/v3/b/${gameBinId}`;

  const response = await fetch(url, {
      method: 'PUT',
      headers: {
          'X-Master-Key': apiKey,
          'Content-Type': 'application/json',
          'X-Bin-Versioning': 'false'
      },
      body: JSON.stringify(updatedData) // Convert data back to JSON string
  });

  if (response.status !== 200) {
      throw new Error('Failed to update data');
  }

  return await response.json();
};

//fetch game data from json bin; modified version
const getGameData = async () => {
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
      throw new Error('No games data found');
  }

  return data;  // Directly return the data without expecting a 'record' field
};

