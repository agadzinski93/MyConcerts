const express = require('express');
const router = express.Router({caseSensitive:false});
const catchAsync = require("../utilities/catchAsync");
const Concert = require("../models/concert");
const concertCont = require("../controllers/concerts");
const {
    isLoggedIn,
    isAuthor,
    validateConcert} = require("../middleware");

router.route("/")
    .get(catchAsync(concertCont.index))
    .post(isLoggedIn, validateConcert, catchAsync(concertCont.createNew));

router.get("/new", isLoggedIn, concertCont.renderNew);

router.route("/:id")
    .get(catchAsync(concertCont.renderConcert))
    .put(isLoggedIn, isAuthor, validateConcert, catchAsync(concertCont.editConcert))
    .delete(isLoggedIn, catchAsync(concertCont.deleteConcert));

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(concertCont.renderEditConcert));

module.exports = router;