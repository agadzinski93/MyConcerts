const express = require('express');
const router = express.Router({caseSensitive:false});
const {concertSchema} = require("../schemas");
const catchAsync = require("../utilities/catchAsync");
const Concert = require("../models/concert");
const ExpressError = require("../utilities/ExpressError");

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

function concertExists(concert) {
    if (!concert) throw new ExpressError("No Such Concert Exists", 400);
}

router.get("/",catchAsync(async(req,res)=>{
    let concerts = await Concert.find({});
    res.render("concerts/index",{concerts});
}));

router.get("/new",(req,res)=>{
    res.render("concerts/new");
});

router.post("/", validateConcert, catchAsync(async(req,res)=>{
    let concert = new Concert(req.body.concert);
    await concert.save();
    req.flash('success', 'Concert Created!');
    res.redirect(`/concerts/${concert._id}`);
}));

router.get("/:id",catchAsync(async(req,res)=>{
    let concert = await Concert.findById(req.params.id).populate('reviews');
    concertExists(concert);
    res.render("concerts/details",{concert});
}));

router.get("/:id/edit",catchAsync(async(req,res)=>{
    let concert = await Concert.findById(req.params.id);
    concertExists(concert);
    res.render(`concerts/edit`,{concert});
}));

router.put("/:id", validateConcert, catchAsync(async(req,res)=>{
    await Concert.findByIdAndUpdate(req.params.id,{...req.body.concert});
    req.flash('success', 'Concert Updated!');
    res.redirect(`/concerts`);
}));

router.delete("/:id/",catchAsync(async(req,res)=>{
    await Concert.findByIdAndDelete(req.params.id);
    req.flash('successDeleted', 'Concert Deleted!');
    res.redirect(`/concerts`);
}));

module.exports = router;