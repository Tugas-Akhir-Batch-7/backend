const router = require('express').Router();

const user = require('../controller/user')


// router.get()
router.get('/profile', (req, res) => {
    // res.send('profile');
    // redirect('/profile/{}');
})
router.get('/profile/:id', user.profile)


module.exports = router;