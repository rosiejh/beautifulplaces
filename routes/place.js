var express = require('express');
var router  = express.Router();
var Place = require('../models/place');

// INDEX - show all places
router.get('/', function (req, res) {
    Place.find({}, function (err, allPlaces) {
        if (err) {
            console.log(err);
        } else {
            res.render("places/index", {place:allPlaces, currentUser: req.user});
        }
    });
});

// CREATE - add new place to DB
router.post('/', function (req, res) {
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
router.get('/new', function (req, res) {
    res.render("places/new");
});

// SHOW - show more info about one place
router.get('/:id', function (req, res) {
    // find the place with provided ID
    Place.findById(req.params.id).populate("comments").exec(function (err, foundplace) {
        if (err) {
            console.log(err);
        } else {
            // render show template with that place
            res.render("places/show", {place: foundplace});
        }
    });
});

module.exports = router;