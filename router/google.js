const router = require('express').Router();
const { generateToken, verify } = require("../helpers/jwt-auth")
const passport = require('passport')

//setup google
var GoogleStrategy = require('passport-google-oauth20').Strategy;
passport.use(new GoogleStrategy({
    clientID: '519018642220-egf6gb0qpeg5g5djmup1i8et73ee1khs.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: "http://localhost:5000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    
    return cb(null, profile);
  }
));

router.get('/',passport.authenticate('google', { scope: ['profile', 'email'] }))

router.get('/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res)=>{
        // console.log({
        //     username: req.user.displayName,
        //     email: req.user.emails.value,
        //     photoProfile: req.user.photos.value,
        // })
        const token = generateToken({
            username: req.user.displayName,
            email: req.user.emails.value,
            photoProfile: req.user.photos.value,
        })
        // res.json({
        //     username: req.user.displayName,
        //     email: req.user.emails[0].value,
        //     photoProfile: req.user.photos[0].value,
        // })
        res.redirect('/?token='+token);
    }
)

passport.serializeUser(function(user, done) {
    done(null, user); 
});

module.exports = router;