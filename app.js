var express        = require('express'),
    app            = express(),
    bodyParser     = require('body-parser'),
    mongoose       = require('mongoose'),
    flash          = require('connect-flash'),
    passport       = require('passport'),
    LocalStrategy  = require('passport-local'),
    methodOverride = require('method-override'),
    Place          = require('./models/place'),
    Comment        = require('./models/comment'),
    User           = require('./models/user'),  
    seedDB         = require('./seeds');

// Requiring routes
var commentRoutes = require('./routes/comments'),
    placeRoutes   = require('./routes/place'),
    indexRoutes   = require('./routes/index');

mongoose.connect('mongodb://localhost/bepl', {useNewUrlParser: true, useUnifiedTopology: true});
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(methodOverride("_method"));
app.use(flash());
// seedDB();

app.locals.moment = require('moment');

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
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use("/", indexRoutes);
app.use("/place", placeRoutes);
app.use("/place/:id/comments", commentRoutes);

app.listen(process.env.PORT, process.env.IP, function() {
    console.log("The server has started!");
});