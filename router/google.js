const router = require('express').Router();
const { generateToken, verify } = require("../helpers/jwt-auth")
const passport = require('passport')
const { sequelize } = require("../db/models");

//database
const db = require('../db/models')
// const db = require('../db/models/') 
const user = db.User

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
  async (req, res) => {
    try{
      const userGet = await user.findOne({where: {email: req.user.emails[0].value}})
      console.log(userGet)
      if(userGet){
        //login
        //create token
        const payload = {
          id: userGet.id,
          [`id_${userGet.role}`]: (await sequelize.query(`SELECT id FROM ${userGet.role} WHERE id_user = ${userGet.id}`))[0][0].id,
          name: userGet.name,
          email: userGet.email,
          role: userGet.role,
        }
        const token = generateToken(payload);
        //create query
        const query = encodeURIComponent(JSON.stringify({token, data: userGet}))
        res.redirect('http://localhost:3000/login?data='+query);
      }else{
        //register
        const {name, picture, email} = req.user._json
        res.redirect(`http://localhost:3000/signup?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}&picture=${encodeURIComponent(picture)}&`)
       
      }
    }catch(err){
      console.log(err)
      res.send('error')
    }
  }
)

passport.serializeUser(function(user, done) {
    done(null, user); 
});

module.exports = router;