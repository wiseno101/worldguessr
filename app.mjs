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
      "coordinates": [
        {
          "round": "1",
          "longitude": "A",
          "latitude": "B"
        },
        {
          "round": "2",
          "longitude": "C",
          "latitude": "D"
        },
        {
          "round": "3",
          "longitude": "E",
          "latitude": "F"
        },
        {
          "round": "4",
          "longitude": "G",
          "latitude": "H"
        },
        {
          "round": "5",
          "longitude": "I",
          "latitude": "J"
        }
      ],
      "hints": {
        "hints_flag": [
          "flag1.png",
          "flag2.png",
          "flag3.png",
          "flag4.png",
          "flag5.png"
        ],
        "hints_region": [
          {
            "lat1": "A",
            "lat2": "B",
            "long1": "C",
            "long2": "D"
          },
          {
            "lat1": "A",
            "lat2": "B",
            "long1": "C",
            "long2": "D"
          },
          {
            "lat1": "A",
            "lat2": "B",
            "long1": "C",
            "long2": "D"
          },
          {
            "lat1": "A",
            "lat2": "B",
            "long1": "C",
            "long2": "D"
          },
          {
            "lat1": "A",
            "lat2": "B",
            "long1": "C",
            "long2": "D"
          }
        ]
      }
    }
  ]
}

*/
const apiKey = '$2a$10$UWl/UsMmB.v6jw7Y1I9zquaKE5OWGPLGu5QBweYdyhZudOt.AJezS';  //JSONbin API key

app.set('views', './views'); // sets views directory for express app
app.set('view engine', 'pug'); // sets the view engine for the express server to pug(can serve pug and html mixed)
app.use(express.static('public')); // sets the static folder to 'public'; needed to call files in html and js

// this assigns the CSP header; this is used for the express server which needs apis allowed in order to speak with jsonbin and googlemapsapi
app.use((req, res, next) => {
    res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; " +
        "script-src 'self' https://maps.googleapis.com https://cdn.jsdelivr.net; " +  // Allow Google Maps API and WebfontLoader script
        "script-src-elem 'self' https://maps.googleapis.com https://cdn.jsdelivr.net; " +  // Allow external script elements (for WebfontLoader)
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +  // Allow stylesheets from Google Fonts
        "img-src 'self' data: https://maps.gstatic.com https://maps.googleapis.com https://streetviewpixels-pa.googleapis.com/; " +  
        "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net; " +  // Allow fonts from Google Fonts and CDN
        "connect-src 'self' https://api.jsonbin.io https://maps.googleapis.com; "  // Allow connections to JSONbin and Google Maps API
    );
    next();
});


//start express server on localhost:1234
app.listen(1234, async () => {
    console.log("Server is running..."); //runs if server is running successfully
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

//fetch game data from json bin; modified version
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

    // Ensure that the 'users' field exists in the response
    if (!data.games) {
        throw new Error('No users data found');
    }

    return data;  // Directly return the data without expecting a 'record' field
};
// Middleware to parse the body
app.use(bodyParser.urlencoded({ extended: false }));

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

//maps page get
app.get('/maps', (req, res) => {
		//function to verify user is logged in
    if (!req.session.user) {
        console.log('Unable to access');
        res.redirect('/login');
    } else {
        console.log("Accessing maps");
        res.render('maps');
    }
});
//games loading, with data from jsonbin
app.get('/games', async (req, res) => {
    if (!req.session.user) {
        console.log('Unable to access');
        res.redirect('/login');
    } else {
        console.log("Accessing maps");
        try {
            const data = await getGamedata(); // Fetch game data
            if (data && data.games) {
                res.render('games', { games: data.games }); // Pass the games array to the Pug template
            } else {
                res.status(500).send('Games data is unavailable'); //error handling
            }
        } catch (err) {
            console.error('Error fetching games:', err);
            res.status(500).send('Internal Server Error');
        }
    };
});

//registerpage post
app.post('/register', express.urlencoded({ extended: false }), async (req, res) => {
    try {
		//create new user using userclass
        const newUser = {
            _id: req.body.uname,
            username: req.body.uname,
            email: req.body.email,
            password: genHash(req.body.pword) // Hash the password
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


//game logic vars

let global_round = 0;
