var express     = require('express'),
    router      = express.Router(),
    Place       = require('../models/place'),
    middleware  = require('../middleware');

// INDEX - show all places
router.get('/', function (req, res) {
    Place.find({}, function (err, allPlaces) {
        if (err) {
            console.log(err);
        } else {
            res.render("places/index", {place:allPlaces, page: 'place', currentUser: req.user});
        }
    });
});

// CREATE - add new place to DB
router.post('/', middleware.isLoggedIn, function (req, res) {
    // get data from form
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var location = req.body.location;
    var author = {
        id: req.user._id,
        username: req.user.username
    };

    var newPlace = {name: name, image: image, description: desc, author: author, location: location};
        
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
router.get('/new', middleware.isLoggedIn, function (req, res) {
    res.render("places/new");
});

// SHOW - show more info about one place
router.get('/:id', function (req, res) {
    // find the place with provided ID
    Place.findById(req.params.id).populate("comments").exec(function (err, foundPlace) {
        if (err) {
            console.log(err);
        } else {
            // render show template with that place
            res.render("places/show", {place: foundPlace});
        }
    });
});

// LIKE Route
router.post('/:id/like', middleware.isLoggedIn, function (req, res) {
    Place.findById(req.params.id, function (err, foundPlace) {
        if (err) {
            console.log(err);
            return res.redirect("/place");
        }

        // check if req.user._id exists in foundPlace.likes
        var foundUserLike = foundPlace.likes.some(function (like) {
            return like.equals(req.user._id);
        });

        if (foundUserLike) {
            // user already liked, removing like
            foundPlace.likes.pull(req.user._id);
        } else {
            // adding the new user like
            foundPlace.likes.push(req.user);
        }

        foundPlace.save(function (err) {
            if (err) {
                console.log(err);
                return res.redirect("/place");
            }
            return res.redirect("/place/" + foundPlace._id);
        });
    });
});

// EDIT place route
router.get('/:id/edit', middleware.checkPlaceOwnership, function (req, res) {
    Place.findById(req.params.id, function (err, foundPlace) {
        res.render("places/edit", {place: foundPlace});
    });
});

// UPDATE place route
router.put('/:id', middleware.checkPlaceOwnership, function (req, res) {
    // find & update the correct place
    Place.findByIdAndUpdate(req.params.id, req.body.place, function (err, updatedPlace) {
        if (err) {
            req.flash("error", err.message);
            res.redirect('/place');
        } else {
            req.flash("success", "Successfully Updated!");
            res.redirect('/place/' + req.params.id);
        }
    });
});

// DELETE place route
router.delete('/:id', middleware.checkPlaceOwnership, function (req, res) {
    Place.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            res.redirect('/place');
        } else {
            res.redirect('/place');
        }
    });
});

module.exports = router;