var express = require('express');
var router  = express.Router({mergeParams: true});
var Place = require('../models/place');
var Comment = require('../models/comment');

// Comments New
router.get('/new', isLoggedIn, function (req, res){
    // find place by id
    Place.findById(req.params.id, function (err, place) {
        if (err) {
            console.log(err);
        } else {
            res.render("comments/new", {place: place});

        }
    });
});

// Comments Create
router.post('/', isLoggedIn, function (req, res) {
    Place.findById(req.params.id, function (err, place) {
        if (err) {
            console.log(err);
            res.redirect("/place");
        } else {
            Comment.create(req.body.comment, function (err, comment) {
                if (err) {
                    console.log(err);
                } else {
                    place.comments.push(comment);
                    place.save();
                    res.redirect('/place/' + place._id);
                }
            });
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

module.exports = router;