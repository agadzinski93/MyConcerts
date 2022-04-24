const express = require('express');
const router = express.Router({caseSensitive:false});
const catchAsync = require("../utilities/catchAsync");
const Concert = require("../models/concert");
const concertCont = require("../controllers/concerts");
const {
    isLoggedIn,
    isAuthor,
    validateConcert} = require("../middleware");
const multer = require('multer');
const {storage} = require('../cloudinary'); //Auto looks for index.js
const filter = require("../utilities/validateImageFile");
const upload = multer({storage, fileFilter: filter, limits: {fileSize: 1000000}});

router.route("/")
    .get(catchAsync(concertCont.index))
    .post(isLoggedIn, upload.single('concert[image]'), validateConcert, catchAsync(concertCont.createNew));

router.get("/new", isLoggedIn, concertCont.renderNew);

router.route("/:id")
    .get(catchAsync(concertCont.renderConcert))
    .put(isLoggedIn, isAuthor, validateConcert, catchAsync(concertCont.editConcert))
    .patch(isLoggedIn, isAuthor, upload.single('concert[image]'), catchAsync(concertCont.editConcertPhoto))
    .delete(isLoggedIn, isAuthor, catchAsync(concertCont.deleteConcert));

router.route("/:id/edit")
    .get(isLoggedIn, isAuthor, catchAsync(concertCont.renderEditConcert))
    .delete(isLoggedIn, isAuthor, catchAsync(concertCont.deleteConcertPhoto));

router.get("/:id/editPhoto", isLoggedIn, isAuthor, catchAsync(concertCont.renderEditConcertPhoto));

module.exports = router;