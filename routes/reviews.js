const express = require('express');
const router = express.Router({mergeParams: true});
const {reviewSchema} = require("../schemas");
const catchAsync = require("../utilities/catchAsync");
const Concert = require("../models/concert");
const Review = require("../models/review");
const ExpressError = require("../utilities/ExpressError");

function validateReview(req,res,next) {
    let {error} = reviewSchema.validate(req.body);
    if (error) {
        let errorMessages = error.details.map(d => d.message).join(",");
        throw new ExpressError(errorMessages, 400);
    }
    else {
        next();
    }
}

router.post("/",validateReview, catchAsync(async(req,res) => {
    const concert = await Concert.findById(req.params.id);
    const review = new Review(req.body.review);

    concert.reviews.push(review);
    await review.save();
    await concert.save();
    req.flash('success', 'Review Posted!');
    res.redirect(`/concerts/${concert._id}`);
}));

router.delete("/:reviewId", catchAsync(async(req,res) => {
    const {id, reviewId} = req.params;
    await Concert.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('successDeleted', 'Review Removed!');
    res.redirect(`/concerts/${id}`);
}));

module.exports = router;