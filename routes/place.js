const express     = require('express'),
      router      = express.Router(),
      Place       = require('../models/place'),
      middleware  = require('../middleware')

// INDEX - show all places
router.get('/', (req, res) => {
    const perPage = 16
    const pageQuery = parseInt(req.query.page)
    const pageNumber = pageQuery ? pageQuery : 1
    Place.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec((err, allPlaces) => {
        Place.count().exec((err, count) => {
            if (err) {
                console.log(err)
            } else {
                res.render("places/index", {
                    place: allPlaces,
                    page: 'place',
                    currentUser: req.user,
                    current: pageNumber,
                    pages: Math.ceil(count / perPage)
                })
            }
        })
    })
})

// CREATE - add new place to DB
router.post('/', middleware.isLoggedIn, (req, res) => {
    // get data from form
    const name = req.body.name
    const image = req.body.image
    const description = req.body.description
    const location = req.body.location
    const author = {
        id: req.user._id,
        username: req.user.username
    }

    const newPlace = { name, image, description, location, author }
        
    // create a new place and save to DB
    Place.create(newPlace, (err, newlyCreated) => {
        if (err) {
            console.log(err)
        } else {
            res.redirect('/place')
        }
    }) 
})

// NEW - show form to create new place
router.get('/new', middleware.isLoggedIn, (req, res) => {
    res.render("places/new")
})

// SHOW - show more info about one place
router.get('/:id', (req, res) => {
    // find the place with provided ID
    Place.findById(req.params.id).populate("comments").exec((err, foundPlace) => {
        if (err) {
            console.log(err)
        } else {
            res.render("places/show", { place: foundPlace })
        }
    })
})

// LIKE Route
router.post('/:id/like', middleware.isLoggedIn, (req, res) => {
    Place.findById(req.params.id, (err, foundPlace) => {
        if (err) {
            console.log(err)
            return res.redirect("/place")
        }

        // check if req.user._id exists in foundPlace.likes
        const foundUserLike = foundPlace.likes.some((like) => {
            return like.equals(req.user._id)
        })

        if (foundUserLike) {
            // user already liked, removing like
            foundPlace.likes.pull(req.user._id)
        } else {
            // adding the new user like
            foundPlace.likes.push(req.user)
        }

        foundPlace.save((err) => {
            if (err) {
                console.log(err)
                return res.redirect("/place")
            }
            return res.redirect("/place/" + foundPlace._id)
        })
    })
})

// EDIT place route
router.get('/:id/edit', middleware.checkPlaceOwnership, (req, res) => {
    Place.findById(req.params.id, (err, foundPlace) => {
        res.render("places/edit", { place: foundPlace })
    })
})

// UPDATE place route
router.put('/:id', middleware.checkPlaceOwnership, (req, res) => {
    // find & update the correct place
    Place.findByIdAndUpdate(req.params.id, req.body.place, (err, updatedPlace) => {
        if (err) {
            req.flash("error", err.message)
            res.redirect('/place')
        } else {
            req.flash("success", "Successfully Updated!")
            res.redirect('/place/' + req.params.id)
        }
    })
})

// DELETE place route
router.delete('/:id', middleware.checkPlaceOwnership, (req, res) => {
    Place.findByIdAndRemove(req.params.id, (err) => {
        if (err) {
            res.redirect('/place')
        } else {
            res.redirect('/place')
        }
    })
})

module.exports = router