const router = require('express').Router();

const user = require('../controller/user')
// const murid = require('../controller/murid')
const model = require('../db/models')
const murid = model.Murid


const { authentication, authorization } = require('../middlewares/auth');


// router.get()
router.get('/murid', (req, res) => {
    const muridGet = murid.findAll()
    res.json(muridGet)
})  
router.get('/profile', authentication, authorization('admin', 'murid', 'guru'), user.profile);
router.get('/profile/:id', authentication, authorization('admin', 'murid', 'guru'), user.profile)


module.exports = router;