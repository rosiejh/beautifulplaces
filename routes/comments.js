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
                    // add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;

                    // save comment
                    comment.save();
                    place.comments.push(comment);
                    place.save();
                    res.redirect('/place/' + place._id);
                }
            });
        }
    });
});

// Comment EDIT route
router.get('/:comment_id/edit', function (req, res) {
    Comment.findById(req.params.comment_id, function (err, foundComment) {
        if (err) {
            res.redirect("back");
        } else {
            res.render('comments/edit', {place_id: req.params.id, comment: foundComment});
        }
    });
});

// Comment UPDATE route
router.put('/:comment_id', function (req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, updatedComment) {
        if (err) {
            res.redirect("back");
        } else {
            res.redirect('/place/' + req.params.id);
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