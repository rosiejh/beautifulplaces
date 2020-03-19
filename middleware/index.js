const Place   = require('../models/place'),
      Comment = require('../models/comment')

const middlewareObj = {}

middlewareObj.checkPlaceOwnership = (req, res, next) => {
    if (req.isAuthenticated()) {
        Place.findById(req.params.id, (err, foundPlace) => {
            if (err) {
                req.flash("error", "Place not found.")
                res.redirect("back")
            } else {
                // Does user own the place?
                if (foundPlace.author.id.equals(req.user._id)) {
                    next()
                } else {
                    req.flash("error", "You don't have permission to do that.")
                    res.redirect("back")
                }
            }
        })
    } else {
        req.flash("error", "You need to login to do that.")
        res.redirect("back")
    }
}

middlewareObj.checkCommentOwnership = (req, res, next) => {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, (err, foundComment) => {
            if (err) {
                res.redirect("back")
            } else {
                if (foundComment.author.id.equals(req.user._id)) {
                    next()
                } else {
                    req.flash("error", "You don't have permission to do that.")
                    res.redirect("back")
                }
            }
        })
    } else {
        req.flash("error", "You need to login to do that.")
        res.redirect("back")
    }
}

middlewareObj.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next()
    }
    req.flash("error", "Please login first.")
    res.redirect("/login")
}

module.exports = middlewareObj