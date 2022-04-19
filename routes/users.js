const express = require('express');
const router = express.Router();
const passport = require('passport');
const userAuth = require('../controllers/userAuth');
const user = require("../controllers/user");
const userAuthCont = require("../controllers/userAuth");
const {isLoggedIn} = require("../middleware");
const catchAsync = require("../utilities/catchAsync");

router.route('/register')
    .get(userAuthCont.renderRegistration)
    .post(catchAsync(userAuthCont.registerUser));

router.route('/login')
    .get(userAuthCont.renderLogin)
    .post(passport.authenticate('local', {failureFlash:true, failureRedirect: '/login'}), userAuthCont.loginUser);

router.get('/logout', userAuthCont.logoutUser)

router.route('/follow')
    .post(isLoggedIn, user.followUser)
    .delete(isLoggedIn, user.unFollowUser);

module.exports = router;