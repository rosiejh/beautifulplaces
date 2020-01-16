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

// Requiring routes
var commentRoutes = require('./routes/comments'),
    placeRoutes   = require('./routes/place'),
    indexRoutes   = require('./routes/index');

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

app.use("/", indexRoutes);
app.use("/place", placeRoutes);
app.use("/place/:id/comments", commentRoutes);

app.listen(3000, process.env.IP, function() {
    console.log("The server has started!");
});