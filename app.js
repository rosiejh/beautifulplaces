var express     = require('express'),
    app         = express(),
    bodyParser  = require('body-parser'),
    mongoose    = require('mongoose'),
    Place       = require('./models/place'),
    seedDB      = require('./seeds');

mongoose.connect('mongodb://localhost/bepl', {useNewUrlParser: true, useUnifiedTopology: true});
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
seedDB();

app.get('/', function (req, res) {
    res.render('landing');
});

// INDEX - show all places
app.get('/place', function (req, res) {
    Place.find({}, function (err, allPlaces) {
        if (err) {
            console.log(err);
        } else {
            res.render("index", {place:allPlaces});
        }
    });
});

// CREATE - add new place to DB
app.post('/place', function (req, res) {
    // get data from form
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var newPlace = {name: name, image: image, description: desc};
    
    // create a new place and save to DB
    Place.create(newPlace, function (err, newlyCreated) {
        if (err) {
            console.log(err);
        } else {
            // redirect back to place page
            res.redirect('/place');
        }
    });
});

// NEW - show form to create new place
app.get('/place/new', function (req, res) {
    res.render("new");
});

// SHOW - show more info about one place
app.get('/place/:id', function (req, res) {
    // find the place with provided ID
    Place.findById(req.params.id).populate("comments").exec(function (err, foundplace) {
        if (err) {
            console.log(err);
        } else {
            // render show template with that place
            res.render("show", {place: foundplace});
        }
    });
});

app.listen(3000, process.env.IP, function() {
    console.log("The server has started!");
});