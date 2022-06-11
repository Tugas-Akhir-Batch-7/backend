const User = require('../db/models/').User
const Murid = require('../db/models/').Murid
const Guru = require('../db/models/').Guru

const getAllByBatch = async (req, res, next) => {
    try {
        const batch = req.query.batch
        const murids = await Murid.findAll({ where: { batch }, include: [User] })
        res.status(200).json({
            success: true,
            message: 'success get all murid',
            data: murids
        })
    }
    catch (error) {
        next(error)
    }
}
module.exports = {
    getAllByBatch
}