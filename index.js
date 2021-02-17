const express = require("express");
const mongoose = require("mongoose");
const engine = require("ejs-mate");
const methodOverride = require("method-override");
const app = express();
const path = require("path");
const Concert = require("./models/concert");

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

app.get("/",(req,res)=>{
    res.render("home");
});

app.get("/concerts",async(req,res)=>{
    let concerts = await Concert.find({});
    res.render("concerts/index",{concerts});
});

app.get("/concerts/new",(req,res)=>{
    res.render("concerts/new");
});

app.post("/concerts",async(req,res)=>{
    let concert = new Concert(req.body.concert);
    await concert.save();
    res.redirect(`/concerts/${concert._id}`);
});

app.get("/concerts/:id",async(req,res)=>{
    let concert = await Concert.findById(req.params.id);
    res.render("concerts/details",{concert});
});

app.get("/concerts/:id/edit",async(req,res)=>{
    let concert = await Concert.findById(req.params.id);
    res.render(`concerts/edit`,{concert});
});

app.put("/concerts/:id",async(req,res)=>{
    await Concert.findByIdAndUpdate(req.params.id,{...req.body.concert});
    res.redirect(`/concerts`);
});

app.delete("/concerts/:id/",async(req,res)=>{
    await Concert.findByIdAndDelete(req.params.id);
    res.redirect(`/concerts`);
});

app.use((req,res,next)=>{
    res.status(404).send("404 Not Found");
    next();
});

app.listen(3000,()=>{
    console.log("Port 3000");
});