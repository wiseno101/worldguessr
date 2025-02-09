const express = require('express');
const app = express();
var http = require("http");
var qString = require("querystring");

let mongoose = require('mongoose');
mongoose.set('bufferCommands', false);

let bp = require('body-parser');
let session = require('express-session');
let crypto = require('crypto');
const userCol = require("./models/userSchema");
const Scenario = require('./models/scenarioSchema'); 

function genHash(input){
    return Buffer.from(crypto.createHash('sha256').update(input).digest('base32')).toString('hex').toUpperCase();
}

app.set('views', './views');
app.set('view engine', 'pug');
app.use(express.static('public'));
app.use((req, res, next) => {
    res.setHeader(
        "Content-Security-Policy",
        "script-src 'self' https://maps.googleapis.com https://cdn.jsdelivr.net;"
    );
    next();
});


app.listen(1234, async ()=> {
    //start and wait for the DB connection
    try{
		await mongoose.connect('mongodb://127.0.0.1:27017/chooseYourAdventure', {useNewUrlParser: true, useUnifiedTopology: true });
    } catch (e){
        console.log(e.message);
    }

    console.log("Server is running...");
});

function docifyUser(params){
    let doc = new userCol({_id: params._id, username: params.username, email: params.email, password: params.password });
    return doc;
}


var postParams;

app.use(session({
	secret:'shhhhh',
	saveUninitialized: false,
	resave: false
}));

//app gets

app.get('/', function(req, res){
    res.render('index');
})

app.get('/login', function(req, res){

        res.render('login');
        console.log("Accessing login page");
    
})

app.get('/register', function(req, res){
    console.log("Accessing register page");
    res.render('register');
})

app.get('/home', function(req, res){
    if (!req.session.user){
        console.log('unable to access');
        res.redirect('/login');
    }
    else {
        console.log("Accessing home page");
        res.render('home');
    }
    
})
app.get('/maps', function(req, res){
    if (!req.session.user){
        console.log('unable to access');
        res.redirect('/login');
    }
    else {
        console.log("Accessing home page");
        res.render('maps');
    }
    
})

app.get('/game', function(req, res){if (!req.session.user){
    console.log('unable to access');
    res.redirect('/login');
}
else {
    console.log("Accessing game page");
    res.render('game');}
})

app.get('/TheEnchantedForest', async function(req, res) {
    if (!req.session.user) {
        res.redirect('/login');
    } else {
        try {
            const storyName = "The Enchanted Forest";
            const currentPage = 1;

            console.log(`Querying for story: ${storyName}, page: ${currentPage}`);

            const scenario = await Scenario.findOne({ story_name: storyName, story_page: currentPage });

            console.log('Story found:', scenario);

            if (!scenario) {
                res.status(404).send("Story page not found");
            } else {
                res.render('TheEnchantedForest', { 
                    trusted: req.session.user,
                    story: scenario
                });
            }
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
    }
});



app.get('/TheGalacticEngima', async function(req, res){
    if (!req.session.user) {
        res.redirect('/login');
    } else {
        try {
            const storyName = "The Galactic Enigma";
            const currentPage = 1;

            console.log(`Querying for story: ${storyName}, page: ${currentPage}`);

            const scenario = await Scenario.findOne({ story_name: storyName, story_page: currentPage });

            console.log('Story found:', scenario);

            if (!scenario) {
                res.status(404).send("Story page not found");
            } else {
                res.render('TGE', { 
                    trusted: req.session.user,
                    story: scenario
                });
            }
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
    }
})

app.get('/TheManor', async function(req, res){
    if (!req.session.user) {
        res.redirect('/login');
    } else {
        try {
            const storyName = "The Manor";
            const currentPage = 1;

            console.log(`Querying for story: ${storyName}, page: ${currentPage}`);

            const scenario = await Scenario.findOne({ story_name: storyName, story_page: currentPage });

            console.log('Story found:', scenario);

            if (!scenario) {
                res.status(404).send("Story page not found");
            } else {
                res.render('TheManor', { 
                    trusted: req.session.user,
                    story: scenario
                });
            }
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
    }
})

// app posts
var postData;

app.post('/TheEnchantedForest', express.urlencoded({ extended: false }), async (req, res) => {
    const nextPage = parseInt(req.body.choice);

    try {
        const storyName = "The Enchanted Forest";
        // Fetch story from MongoDB for the chosen page
        const scenario = await Scenario.findOne({ story_name: storyName, story_page: nextPage });

        if (!scenario) {
            // Handle if story page not found
            res.status(404).send("Story page not found");
        } else {
            // Update session to remember the user's progress
            req.session.storyProgress = {
                story_name: storyName,
                current_page: nextPage
            };

            res.render('TheEnchantedForest', { 
                trusted: req.session.user,
                story: scenario
            });
        }
    } catch (error) {
        // Handle database error
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

app.post('/TheGalacticEnigma', express.urlencoded({ extended: false }), async (req, res) => {
    const nextPage = parseInt(req.body.choice);

    try {
        const storyName = "The Galactic Enigma";
        // Fetch story from MongoDB for the chosen page
        const scenario = await Scenario.findOne({ story_name: storyName, story_page: nextPage });

        if (!scenario) {
            // Handle if story page not found
            res.status(404).send("Story page not found");
        } else {
            // Update session to remember the user's progress
            req.session.storyProgress = {
                story_name: storyName,
                current_page: nextPage
            };

            res.render('TGE', { 
                trusted: req.session.user,
                story: scenario
            });
        }
    } catch (error) {
        // Handle database error
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
})
app.post('/TheManor', express.urlencoded({ extended: false }), async (req, res) => {
        const nextPage = parseInt(req.body.choice);
    
        try {
            const storyName = "The Manor";
            // Fetch story from MongoDB for the chosen page
            const scenario = await Scenario.findOne({ story_name: storyName, story_page: nextPage });
    
            if (!scenario) {
                // Handle if story page not found
                res.status(404).send("Story page not found");
            } else {
                // Update session to remember the user's progress
                req.session.storyProgress = {
                    story_name: storyName,
                    current_page: nextPage
                };
    
                res.render('TheManor', { 
                    trusted: req.session.user,
                    story: scenario
                });
            }
        } catch (error) {
            // Handle database error
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
})

app.post('/register', express.urlencoded({extended:false}), async (req, res, next)=>{
    console.log(req.body.user); 
    if (req.body.uname.split(/[;:,-\s ]+/).length > 1) {
	res.render('register', {msg: "Username must be one word"})
    }
	let hashPass = req.body.pword
    let newUser = docifyUser({_id: req.body.uname, username: req.body.uname, password: hashPass, email: req.body.email})
    await newUser.save()
	res.redirect('login')
});

app.post('/login', express.urlencoded({extended:false}), async (req, res, next)=>{
	let untrusted= {user: req.body.uname, password: req.body.pword};
	console.log(untrusted.password)
	try{
		let result = await userCol.findOne({_id: req.body.uname});
		if (untrusted.password.toString().toUpperCase()==result.password.toString().toUpperCase()){
			let trusted={username: result.username.toString()};
            req.session.user = trusted;
            console.log('got it right');
			res.redirect('/home');
		} else{
            console.log('wrong password');
			res.redirect('/login');
		}
	} catch (err){
		next(err)
	}
});
app.use('*', function(req, res){
    res.writeHead(404);
    res.end(`<h1> ERROR 404. ${req.url} NOT FOUND</h1><br><br>`);
});
app.use((err, req, res, next)=>{
	res.status(500).render('error', {message: err.message})
})


