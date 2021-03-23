const express = require('express');
const router = express.Router({mergeParams: true});
const catchAsync = require("../utilities/catchAsync");
const reviewCont = require("../controllers/reviews");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware");

router.post("/", isLoggedIn, validateReview, catchAsync(reviewCont.createReview));

router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchAsync(reviewCont.deleteReview));

module.exports = router;