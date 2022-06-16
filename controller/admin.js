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

const updateTagihan = async (req, res, next) => {
    const t = await sequelize.transaction()
    try {
        const { id } = req.params
        const tagihanGet = await Tagihan.findOne({ where: { id } })
        if (!tagihanGet) throw ApiError.badRequest('Tagihan not found')
        const { total_bill, dp } = req.body
        if (!total_bill || !dp) throw ApiError.badRequest('total_bill, dp is required')
        if (dp < 0) throw ApiError.badRequest('DP tidak boleh negatif')
        if (dp > total_bill) throw ApiError.badRequest('DP tidak boleh lebih besar dari total_bill')

        // update tabel tagihan
        const tagihan = await Tagihan.update({
            total_bill: total_bill,
            dp: dp,
        }, {
            where: { id },
            returning: true,
            transaction: t
        })

        /*
        @DESC
        edit data dpnya (pembayaran paling awal di id tagihan tersebut)
        pada tabel pembayaran, 
        */
        if (dp !== tagihanGet.dp) {
            const pembayaranDP = await Pembayaran.findAll({
                where: {
                    id_tagihan: id,
                },
                order: ['date']
            })
            if (pembayaranDP.length > 0) {
                const pembayaranUpdated = await Pembayaran.update(
                    {
                        amount: dp,
                    },
                    {
                        where: { id: pembayaranDP[0].id },
                        transaction: t
                    }
                )
            }
        }
        t.commit()

        return res.status(200).json({
            success: true,
            message: 'success update tagihan',
            data: tagihan[1]
        })
        // console.log(pembayaranDP[0].id)
        // res.send(id)
    } catch (error) {
        t.rollback()
        next(error)
    }
}

const createPembayaran = async (req, res, next) => {
    // const t
    try {
        const { id_tagihan } = req.params
        const { amount } = req.body
        if (!amount) throw ApiError.badRequest('amount is required')
        const tagihanGet = await Tagihan.findOne({ where: { id: id_tagihan } })
        if (!tagihanGet) throw ApiError.badRequest('Tagihan not found')

        const jumlahPembayaran = await sequelize.query(
            `
            SELECT SUM(amount) AS jumlah_pembayaran
            FROM pembayaran
            WHERE id_tagihan = :id_tagihan
            `
            , {
                replacements: {
                    id_tagihan: id_tagihan
                }
            }
        )
        const jumlahBayar = jumlahPembayaran[0][0].jumlah_pembayaran
        const sisaTagihan = tagihanGet.total_bill - jumlahBayar

        if (amount > sisaTagihan) {
            throw ApiError.badRequest(`Pembayaran tidak boleh melebihi sisa tagihan: ${sisaTagihan}`)
        }
        // console.log(jumlahPembayaran[0][0].jumlah_pembayaran)
        const pembayaran = await Pembayaran.create({
            id_tagihan: id_tagihan,
            amount: amount,
            date: new Date(),
        }, {
            returning: true,
        })

        const pembayaranJSON = pembayaran.toJSON()
        return res.status(201).json({
            success: true,
            message: 'success create pembayaran',
            data: pembayaranJSON
        })
    } catch (error) {
        next(error)
    }
}


module.exports = {
    getAllByRole,
    getAllMurid,
    getAllGuru,
    createTagihan,
    updateTagihan,
    createPembayaran,
}