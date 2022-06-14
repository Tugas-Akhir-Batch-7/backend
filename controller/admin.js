const { sequelize } = require("../db/models");

const User = require('../db/models/').User
const Murid = require('../db/models/').Murid
const Guru = require('../db/models/').Guru
const Tagihan = require('../db/models/').Tagihan
const Pembayaran = require('../db/models/').Pembayaran

const ApiError = require('../helpers/api-error')



const getAllByRole = async (req, res, next) => {
    try {
        const role = req.query.role
        // return res.send(role)
        if (role === 'guru') {
            const gurus = await Guru.findAll({
                include: [
                    { model: User, attributes: ['name', 'email', 'photo'] }
                ]
            })
            return res.status(200).json({
                success: true,
                message: 'success get all guru',
                data: gurus
            })
        } else if (role === 'murid') {
            const murids = await Murid.findAll({
                include: [
                    { model: User, attributes: ['name', 'email', 'photo'] }
                ]
            })
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
        const murids = await Murid.findAll({ include: User })
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
        const gurus = await Guru.findAll({ include: User })
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
    const t = await sequelize.transaction()
    try {
        // return res.send('create tagihan')
        const { id_murid, total_bill, dp } = req.body
        if (!id_murid || !total_bill || !dp) {
            throw ApiError.badRequest('id_murid, total_bill, dp is required')
        }

        let murid = await Murid.findOne({ where: { id: id_murid } })

        if (!murid) throw ApiError.badRequest('Murid not found')

        let tagihan_check = await Tagihan.findOne({
            where: {
                id_murid,
                is_lunas: false,
            }
        })
        if (tagihan_check) {
            throw ApiError.badRequest(`User dengan id_murid ${id_murid} sedang memiliki tagihan aktif`)
        }
        murid = murid.toJSON()
        if (dp < 0) throw ApiError.badRequest('DP tidak boleh negatif')
        if (dp > total_bill) throw ApiError.badRequest('DP tidak boleh lebih besar dari total_bill')
        
        let tagihan
        if (dp === total_bill) {
            tagihan = await Tagihan.create({
                id_murid: murid.id,
                total_bill: total_bill,
                dp: dp,
                is_lunas: true,
            }, { transaction: t })
        } else {
            tagihan = await Tagihan.create({
                id_murid: murid.id,
                total_bill: total_bill,
                dp: dp,
                is_lunas: false,
            }, { transaction: t })
        }

        const tagihanJSON = tagihan.toJSON()
        await t.commit()
        // console.log(tagihan)
        return res.status(201).json({
            success: true,
            message: 'success create tagihan',
            data: tagihanJSON
        })


    } catch (error) {
        t.rollback()
        next(error)
    }
}


module.exports = {
    getAllByRole,
    getAllMurid,
    getAllGuru,
    createTagihan
}