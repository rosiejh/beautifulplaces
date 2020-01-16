var express       = require('express'),
    app           = express(),
    bodyParser    = require('body-parser'),
    mongoose      = require('mongoose'),
    passport      = require('passport'),
    LocalStrategy = require('passport-local'),
    Place         = require('./models/place'),
    Comment       = require('./models/comment'),
    User          = require('./models/user'),  
    seedDB        = require('./seeds');

mongoose.connect('mongodb://localhost/bepl', {useNewUrlParser: true, useUnifiedTopology: true});
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
seedDB();

// PASSPORT Configuration
app.use(require('express-session')({
    secret: "Shh, secret",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    next();
});

app.get('/', function (req, res) {
    res.render('landing');
});

// INDEX - show all places
app.get('/place', function (req, res) {
    Place.find({}, function (err, allPlaces) {
        if (err) {
            console.log(err);
        } else {
            res.render("places/index", {place:allPlaces, currentUser: req.user});
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
    res.render("places/new");
});

// SHOW - show more info about one place
app.get('/place/:id', function (req, res) {
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


// =============================
// COMMENTS ROUTES
// =============================

app.get('/place/:id/comments/new', isLoggedIn, function (req, res){
    // find place by id
    Place.findById(req.params.id, function (err, place) {
        if (err) {
            console.log(err);
        } else {
            res.render("comments/new", {place: place});

        }
    });
});

app.post('/place/:id/comments', isLoggedIn, function (req, res) {
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

// ===================
// AUTH ROUTES
// ===================

// show register form
app.get('/register', function (req, res) {
    res.render("register");
});

// handle sign up logic
app.post('/register', function (req, res) {
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local") (req, res, function () {
            res.redirect("/place");
        });
    });
});

// show login form
app.get('/login', function (req, res) {
    res.render("login");
});

// handling login logic
app.post('/login', passport.authenticate("local",
    {
        successRedirect: "/place",
        failureRedirect: "/login"
    }), function (req, res) {
});

// logout route
app.get('/logout', function (req, res) {
    req.logout();
    res.redirect("/place");
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
};

app.listen(3000, process.env.IP, function() {
    console.log("The server has started!");
});