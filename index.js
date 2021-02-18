const express = require("express");
const mongoose = require("mongoose");
const engine = require("ejs-mate");
const {concertSchema} = require("./schemas");
const expressError = require("./utilities/ExpressError");
const catchAsync = require("./utilities/catchAsync");
const methodOverride = require("method-override");
const app = express();
const path = require("path");
const Concert = require("./models/concert");
const ExpressError = require("./utilities/ExpressError");

mongoose.connect("mongodb://localhost:27017/concert-finder",{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true
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

function validateConcert(req,res,next) {
    let {error} = concertSchema.validate(req.body);
    if (error) {
        let errorMessages = error.details.map(d => d.message).join(",");
        throw new ExpressError(errorMessages, 400);
    }
    else {
        next();
    }
}

app.get("/",(req,res)=>{
    res.render("home");
});

app.get("/concerts",catchAsync(async(req,res)=>{
    let concerts = await Concert.find({});
    res.render("concerts/index",{concerts});
}));

app.get("/concerts/new",(req,res)=>{
    res.render("concerts/new");
});

app.post("/concerts", validateConcert, catchAsync(async(req,res)=>{
    let concert = new Concert(req.body.concert);
    await concert.save();
    res.redirect(`/concerts/${concert._id}`);
}));

app.get("/concerts/:id",catchAsync(async(req,res)=>{
    let concert = await Concert.findById(req.params.id);
    if (!concert) throw new ExpressError("No Such Concert Exists", 400);
    res.render("concerts/details",{concert});
}));

app.get("/concerts/:id/edit",catchAsync(async(req,res)=>{
    let concert = await Concert.findById(req.params.id);
    res.render(`concerts/edit`,{concert});
}));

app.put("/concerts/:id", validateConcert, catchAsync(async(req,res)=>{
    await Concert.findByIdAndUpdate(req.params.id,{...req.body.concert});
    res.redirect(`/concerts`);
}));

app.delete("/concerts/:id/",catchAsync(async(req,res)=>{
    await Concert.findByIdAndDelete(req.params.id);
    res.redirect(`/concerts`);
}));

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