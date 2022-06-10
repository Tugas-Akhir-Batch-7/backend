const router = require('express').Router();

const user = require('../controller/user')

const { authentication, authorization } = require('../middlewares/auth');


// router.get()
router.get('/profile', authentication, authorization('admin', 'murid', 'guru'), user.profile);
router.get('/profile/:id', authentication, authorization('admin', 'murid', 'guru'), user.profile)


module.exports = router;