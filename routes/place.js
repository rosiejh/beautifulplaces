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
router.post('/', isLoggedIn, function (req, res) {
    // get data from form
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newPlace = {name: name, image: image, description: desc, author: author};
    
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
router.get('/new', isLoggedIn, function (req, res) {
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

// EDIT place route
router.get('/:id/edit', checkPlaceOwnership, function (req, res) {
    Place.findById(req.params.id, function (err, foundPlace) {
        res.render("places/edit", {place: foundPlace});
    });
});

// UPDATE place route
router.put('/:id', checkPlaceOwnership, function (req, res) {
    // find & update the correct place
    Place.findByIdAndUpdate(req.params.id, req.body.place, function (err, updatedPlace) {
        if (err) {
            res.redirect('/place');
        } else {
            res.redirect('/place/' + req.params.id);
        }
    });
});

// DELETE place route
router.delete('/:id', checkPlaceOwnership, function (req, res) {
    Place.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            res.redirect('/place');
        } else {
            res.redirect('/place');
        }
    });
});

// middleware
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
};

function checkPlaceOwnership (req, res, next) {
    if (req.isAuthenticated()) {
        Place.findById(req.params.id, function (err, foundPlace) {
            if (err) {
                res.redirect("back");
            } else {
                // Does user own the place?
                if (foundPlace.author.id.equals(req.user._id)) {
                    next();
                } else {
                    res.redirect("back");
                }
            }
        });
    } else {
        res.redirect("back");
    }
};

module.exports = router;