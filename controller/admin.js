const User = require('../db/models/').User
const Murid = require('../db/models/').Murid
const Guru = require('../db/models/').Guru


const getAllByRole = async (req, res, next) => {
    try {
        const role = req.query.role
        // return res.send(role)
        if(role === 'guru') {
            const gurus = await Guru.findAll({include: [
                {model: User, attributes: ['name', 'email', 'photo']}
            ]})
            return res.status(200).json({
                success: true,
                message: 'success get all guru',
                data: gurus
            })
        } else if(role === 'murid') {
            const murids = await Murid.findAll({include: [
                {model: User, attributes: ['name', 'email', 'photo']}
            ]})
            return res.status(200).json({
                success: true,
                message: 'success get all murid',
                data: murids
            })
        }
        throw ApiError.badRequest('Role not found')
        // const users = await User.findAll({where: {role}, include: [Murid, Guru]})
        // res.status(200).json({
        //     success: true,
        //     message: 'berhasil',
        //     data: users
        // })
    } catch (error) {
        next(error)
    }
}

const getAllMurid = async (req, res, next) => {
    try {
        const murids = await Murid.findAll({include: User})
        res.status(200).json({
            success: true,
            message: 'success get all murid',
            data: murids
        })

        // // console.log(muridGet)
        // res.json(muridGet)
    } catch (error) {
        next(error)
    }
}

const getAllGuru = async (req, res, next) => {
    try {
        const gurus = await Guru.findAll({include: User})
        // res.json(guru)
        res.status(200).json({
            success: true,
            message: 'success get all guru',
            data: gurus
        })
    } catch (error) {
        next(error)
    }
}

const createTagihan = async (req, res, next) => {
    try {
        return res.send('create tagihan')
        const {id_murid, dp, total_bill} = req.body
        const murid = await Murid.findOne({where: {id: id_murid}})
        return 
        if(!murid) throw ApiError.badRequest('Murid not found')


    } catch (error) {
        next(error)
    }
}

module.exports = {
    getAllByRole,
    getAllMurid,
    getAllGuru,
    createTagihan
}