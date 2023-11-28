require('dotenv').config();

const mongoSecret = process.env.MONGO_SECRET;
const express = require("express");
const mongoose = require("mongoose");
const mongoSanitize = require("express-mongo-sanitize");
const MongoStore = require("connect-mongo");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const helmet = require("helmet");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const app = express();
const path = require("path");
const PORT = process.env.PORT || 3000;
const ExpressError = require("./utilities/ExpressError");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user");

app.use(
    mongoSanitize({
        replaceWith:"_",
    })
);

//Web Content Policy and CORS
app.use(helmet({
    contentSecurityPolicy:{
      useDefaults:true,
      directives:{
        imgSrc:["'self'","data:","https://res.cloudinary.com"],
        scriptSrc:["'self'","'unsafe-inline'","blob:",'https://cdn.jsdelivr.net','https://api.mapbox.com'],
        defaultSrc:["'self'","https://api.mapbox.com","https://events.mapbox.com"]
      }
    },
}));

//Routes
const routeConcert = require("./routes/concerts");
const routeReviews = require("./routes/reviews");
const routeUsers = require("./routes/users");

let mongoDBUrl = process.env.MONGODB_URI;
if (process.env.NODE_ENV === "development") {
    mongoDBUrl = "mongodb://127.0.0.1:27017/concert-finder?readPreference=primary&appname=MongoDB%20Compass&ssl=false";
}


mongoose.connect(mongoDBUrl).
    catch(() => new ExpressError("Failed to Connect to MongoDB Atlas", 500));

const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{console.log("Connected")});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname,"views"));

app.use(expressLayouts);
app.set('layout','layout/boilerplate');

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"public")));

const store = new MongoStore({
    mongoUrl: mongoDBUrl,
    touchAfter: 24 * 3600,
    crypto: {
        secret:mongoSecret,
    }
});;

store.on("error", function(e) {
    console.log("store error: ", e);
});

const sessionConfig = {
    store,
    name: 'session',
    secret:mongoSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 *60 * 24 * 7,
        httpOnly: true,
        sameSite:'strict',
        secure: (process.env.NODE_ENV === 'production') ? true : false
    }
}
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());    //Must use AFTER session()
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
    res.locals.currentUser = req.user    //Passport adds user obj to req.user
    res.locals.success = req.flash('success');
    res.locals.successDeleted = req.flash('successDeleted');
    res.locals.error = req.flash('error');
    next();
});

app.get("/",(req,res)=>{
    res.render("home",{layout:false});
});

app.use("/concerts", routeConcert);
app.use("/concerts/:id/reviews", routeReviews);
app.use("/", routeUsers);

app.all('*', (req,res,next) => {
    next(new ExpressError("404 Page Not Found", 404));
});

app.use((err,req,res,next)=>{
    let {statusCode = 500} = err;
    if (!err.message) err.message = "Something went wrong!";
    res.status(statusCode).render("error", {err});
});

app.listen(PORT,()=>{});