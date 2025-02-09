import express from 'express';
import http from 'http';  // Import 'http' module
import qString from 'querystring';  // Import 'querystring' module
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import session from 'express-session';
import crypto from 'crypto';

const app = express();

// JSONbin API Details
const binId = '67a9064facd3cb34a8dbaf8d';  // Replace with your JSONbin ID
const apiKey = '$2a$10$UWl/UsMmB.v6jw7Y1I9zquaKE5OWGPLGu5QBweYdyhZudOt.AJezS';  // Replace with your JSONbin API key

app.set('views', './views');
app.set('view engine', 'pug');
app.use(express.static('public'));
app.use((req, res, next) => {
    res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; " +
        "script-src 'self' https://maps.googleapis.com https://cdn.jsdelivr.net; " +
        "script-src-elem 'self' https://maps.googleapis.com https://cdn.jsdelivr.net; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +  // Allow stylesheets from Google Fonts
        "img-src 'self' data: https://maps.gstatic.com https://maps.googleapis.com https://streetviewpixels-pa.googleapis.com/; " +  
        "font-src 'self' https://fonts.gstatic.com https://maps.googleapis.com; " +  // Allow font files from Google Fonts
        "connect-src 'self' https://api.jsonbin.io https://maps.googleapis.com;"
    );
    next();
});

app.listen(1234, async () => {
    console.log("Server is running...");
});

// Helper function to hash passwords
function genHash(input){
    return Buffer.from(crypto.createHash('sha256').update(input).digest('base32')).toString('hex').toUpperCase();
}

// Fetch user data from JSONbin
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




// Put updated data back to JSONbin
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

// Middleware to parse the body
app.use(bodyParser.urlencoded({ extended: false }));

// Session middleware
app.use(session({
    secret: 'shhhhh',
    saveUninitialized: false,
    resave: false
}));

// Routes

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/login', (req, res) => {
    res.render('login');
    console.log("Accessing login page");
});

app.get('/register', (req, res) => {
    console.log("Accessing register page");
    res.render('register');
});

app.get('/home', (req, res) => {
    if (!req.session.user) {
        console.log('Unable to access');
        res.redirect('/login');
    } else {
        console.log("Accessing home page");
        res.render('home');
    }
});

app.get('/maps', (req, res) => {
    if (!req.session.user) {
        console.log('Unable to access');
        res.redirect('/login');
    } else {
        console.log("Accessing maps");
        res.render('maps');
    }
});

app.post('/register', express.urlencoded({ extended: false }), async (req, res) => {
    try {
        const newUser = {
            _id: req.body.uname,
            username: req.body.uname,
            email: req.body.email,
            password: genHash(req.body.pword) // Hash the password
        };

        // Get current data from JSONbin
        const data = await getJSONData();

        // Check if the username already exists
        if (data.users.find(user => user._id === req.body.uname)) {
            return res.render('register', { msg: "Username already exists" });
        }

        // Add the new user to the users array
        data.users.push(newUser);

        // Update JSONbin with the new data
        await putJSONData(data);

        res.redirect('login');
    } catch (err) {
        console.error(err);
        res.render('register', { msg: "Error registering user" });
    }
});

app.post('/login', express.urlencoded({ extended: false }), async (req, res) => {
    try {
        const untrusted = { user: req.body.uname, password: req.body.pword };

        // Get the current user data
        const data = await getJSONData();

        // Find the user by username
        const user = data.users.find(u => u._id === req.body.uname);

        // If user exists, compare hashed password
        if (user && genHash(untrusted.password) === user.password) {
            req.session.user = { username: user.username };
            console.log("User session made");
            res.redirect('/home');
        } else {
            console.log("User session not made");
            res.redirect('/login');
        }
    } catch (err) {
        console.error(err);
        res.redirect('/login');
    }
});


app.use('*', (req, res) => {
    res.writeHead(404);
    res.end(`<h1> ERROR 404. ${req.url} NOT FOUND</h1><br><br>`);
});

app.use((err, req, res, next) => {
    res.status(500).render('error', { message: err.message });
});
