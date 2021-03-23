const User = require('../models/user');

module.exports = {
    renderRegistration(req,res) {
        res.render('users/register');
    },
    async registerUser(req,res) {

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
    },
    renderLogin(req,res) {
        res.render('users/login');
    },
    async loginUser (req,res) {
        req.flash('success', `Welcome back, ${req.body.username}`);
        let redirectUrl = req.session.loggedPath || '/concerts';
        delete req.session.loggedPath;
        res.redirect(redirectUrl);
    },
    logoutUser(req,res) {
        req.logout();
        req.flash('success', 'You have successfully logged out');
        res.redirect('/concerts');
    }
}