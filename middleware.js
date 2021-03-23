const express = require('express');
const Concert = require("./models/concert");
const Review = require("./models/review");
const {concertSchema, reviewSchema} = require("./schemas");
const ExpressError = require("./utilities/ExpressError");

function concertExists(concert) {
    if (!concert) throw new ExpressError("No Such Concert Exists", 400);
}

module.exports = {
    isLoggedIn(req,res,next){
        if (!req.isAuthenticated()) {
            req.session.loggedPath = req.originalUrl;
            req.flash('error', 'You must be logged in');
            return res.redirect('/login');
    }
        next()
    },
    async isAuthor(req,res,next){
        let concert = await Concert.findById(req.params.id);
        if (!concert.author.equals(req.user._id)) {
            req.flash('error', 'You are not authorized to do that');
            return res.redirect(`/concerts/${req.params.id}`);
        }
        next();
    },
    async isReviewAuthor(req,res,next){
        let review = await Review.findById(req.params.reviewId);
        if (!review.author.equals(req.user._id)) {
            req.flash('error', 'You are not authorized to do that');
            return res.redirect(`/concerts/${req.params.id}`);
        }
        next();
    },
    validateConcert(req,res,next) {
        let {error} = concertSchema.validate(req.body);
        if (error) {
            let errorMessages = error.details.map(d => d.message).join(",");
            throw new ExpressError(errorMessages, 400);
        }
        else {
            next();
        }
    },
    concertExists(concert) {
        if (!concert) throw new ExpressError("No Such Concert Exists", 400);
    },
    validateReview(req,res,next) {
        let {error} = reviewSchema.validate(req.body);
        if (error) {
            let errorMessages = error.details.map(d => d.message).join(",");
            throw new ExpressError(errorMessages, 400);
        }
        else {
            next();
        }
    }
};