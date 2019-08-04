const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require("passport");

// User model
const User = require("../models/user");

// Login page
router.get('/login', (req, res) => {
    res.render("login");
})

// Register
router.get('/register', (req, res) => {
    res.render("register");
})

// Register User handle
router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];

    // Check required fields
    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Please fill in all the fields' })
    }

    // Check passwords
    if (password !== password2) {
        errors.push({ msg: 'Passwords do not match' })
    }

    // Check password length
    if (password.length < 8) {
        errors.push({ msg: 'Password should be atleast 8 characters '})
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        })
    } else {
        // After validation is passed
        User.findOne({ email: email })
            .then(user => {
                if (user) {
                    // User already exists
                    errors.push({ msg: 'Email already exists' })
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2
                    })
                } else {
                    const newUser = new User({
                        name,
                        email,
                        password,
                    })

                    // Hash the password
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(
                            newUser.password,
                            salt,
                            (err, hash) => {
                                if (err) throw err;
                                // Set password to hash
                                newUser.password = hash;
                                // console.log(newUser);
                                // Save user data
                                newUser.save()
                                    .then(user => {
                                        req.flash("success_msg", "You are now registered successfully");
                                        res.redirect('/users/login')
                                    })
                                    .catch(err => {
                                        console.log(err)
                                    })
                            }
                        )
                    })
                }
            })
    }
})

// Login user handle
router.post('/login', (req, res, next) => {
    passport.authenticate(
        'local',
        {
            successRedirect: "/dashboard",
            failureRedirect: "/users/login",
            failureFlash: true
        }
    )(req, res, next);
})

// Logout handle
router.get('/logout', (req, res) => {
    req.logout();
    req.flash("success_msg", "You are logged out!");
    res.redirect("/users/login")
})

module.exports = router;