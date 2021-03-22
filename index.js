const express = require("express");
const mongoose = require("mongoose");
const engine = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const app = express();
const path = require("path");
const ExpressError = require("./utilities/ExpressError");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user");

//Routes
const routeConcert = require("./routes/concerts");
const routeReviews = require("./routes/reviews");
const routeUsers = require("./routes/users");

mongoose.connect("mongodb://localhost:27017/concert-finder",{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true,
    useFindAndModify:false
});

const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("Databse connected");
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname,"views"));

app.engine("ejs",engine);

app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"public")));

const sessionConfig = {
    secret:"34fthf4i4534t554ft5",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + (1000 * 60 *60 * 24 * 7),
        maxAge: 1000 * 60 *60 * 24 * 7,
        httpOnly: true
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
    res.render("home");
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

app.listen(3000,()=>{
    console.log("Port 3000");
});