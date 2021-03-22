const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require("../utilities/catchAsync");
const User = require('../models/user');

router.get('/register', (req,res) => {
    res.render('users/register');
});

router.post('/register', catchAsync(async(req,res) => {

    try {
        let {email, username, password} = req.body;
        let newUser = new User({email, username});
        let registeredUser = await User.register(newUser, password);
        req.login(registeredUser, err => {
            if (err) return next();

            req.flash('success', `Welcome, ${username}`);
            res.redirect('/concerts');
        });
    }catch(e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}));

router.get('/login', (req,res) => {
    res.render('users/login');
});

router.post('/login', passport.authenticate('local', {failureFlash:true, failureRedirect: '/login'}), async(req,res) => {
    req.flash('success', `Welcome back, ${req.body.username}`);
    let redirectUrl = req.session.loggedPath || '/concerts';
    delete req.session.loggedPath;
    res.redirect(redirectUrl);
});

router.get('/logout', (req,res) => {
    req.logout();
    req.flash('success', 'You have successfully logged out');
    res.redirect('/concerts');
})

module.exports = router;