const router = require('express').Router();

const user = require('../controller/user')

const { authentication, authorization } = require('../middlewares/auth');


// router.get()
router.get('/profile', (req, res) => {
    // res.send('profile');
    // redirect('/profile/{}');
})
router.get('/profile/:id', authentication, authorization('admin', 'murid', 'guru'), user.profile)


module.exports = router;