const router = require('express').Router();

const user = require('../controller/user')
// const murid = require('../controller/murid')
const model = require('../db/models')
const murid = model.Murid


const { authentication, authorization } = require('../middlewares/auth');

const userMiddleware = [
    authentication, authorization('admin', 'guru', 'murid')
]
// router.get()
router.get('/murid', async (req, res) => {
    const muridGet = await murid.findAll()
    // console.log(muridGet)
    res.json(muridGet)
})  
router.get('/profile', authentication, authorization('admin', 'murid', 'guru'), user.profile);
router.put('/profile', userMiddleware, user.updateProfile)
router.get('/profile/:id', authentication, authorization('admin', 'murid', 'guru'), user.profile)


module.exports = router;