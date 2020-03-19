const express        = require('express'),
      app            = express(),
      bodyParser     = require('body-parser'),
      mongoose       = require('mongoose'),
      dotenv         = require('dotenv'),
      flash          = require('connect-flash'),
      passport       = require('passport'),
      LocalStrategy  = require('passport-local'),
      methodOverride = require('method-override'),
      Place          = require('./models/place'),
      Comment        = require('./models/comment'),
      User           = require('./models/user')

// Requiring routes
const commentRoutes = require('./routes/comment'),
      placeRoutes   = require('./routes/place'),
      indexRoutes   = require('./routes/index')

mongoose.connect(process.env.MONGODB_URL,
    {useNewUrlParser: true, useUnifiedTopology: true})
app.use(bodyParser.urlencoded({extended: true}))
app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'))
app.use(methodOverride("_method"))
app.use(flash())
dotenv.config({ path: './config.env' })

app.locals.moment = require('moment')

// PASSPORT Configuration
app.use(require('express-session')({
    secret: "Shh, secret",
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
    res.locals.currentUser = req.user
    res.locals.error = req.flash("error")
    res.locals.success = req.flash("success")
    next()
})

app.use("/", indexRoutes)
app.use("/place", placeRoutes)
app.use("/place/:id/comments", commentRoutes)

const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`Listening on port: ${port}`)
})