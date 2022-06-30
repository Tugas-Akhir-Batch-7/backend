const { sequelize, Sequelize } = require("../db/models");

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
        let murids
        let responseMessage
        if (req.query.status) {
            murids = await sequelize.query(
                `
                SELECT murid.id, users.name from murid
                JOIN users ON murid.id_user = users.id
                WHERE status= :status
                `,
                {
                    replacements: {
                        status: req.query.status
                    }
                }
            )
            murids = murids[0]
            responseMessage = `success get all murid status ${req.query.status}`

        } else {
            murids = await Murid.findAll({ include: User })
            responseMessage = `success get all murid`

        }
        res.status(200).json({
            success: true,
            message: responseMessage,
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
const getAllTagihan = async (req, res, next) => {
    try {
        // const { id_murid } = req.params
        // const tagihan = await Tagihan.findAll({

        // })
        let tagihan = await sequelize.query(`
        SELECT tagihan.id, u."name", tagihan.total_bill, tagihan.dp, tagihan.is_lunas FROM tagihan
        JOIN murid as m ON tagihan.id_murid = m.id
        JOIN users as u ON m.id_user = u.id
;
        `)
        tagihan = tagihan[0]
        // if (!tagihan) throw ApiError.badRequest('Tagihan not found')

        res.status(200).json({
            success: true,
            message: 'success get tagihan',
            data: tagihan
        })
    } catch (error) {
        next(error)
    }
}
const detailTagihan = async (req, res, next) => {
    try {
        const { id } = req.params
        // const tagihan = await Tagihan.findOne({
        //     where: {
        //         id: id
        //     }
        // })
        let tagihan = await sequelize.query(`
        SELECT t.id, total_bill, t.is_lunas, t.dp, users."name", batch."name" as "batch_name"
        FROM tagihan as t
        JOIN murid ON t.id_murid = murid.id
        JOIN users ON murid.id_user = users.id
        JOIN batch ON murid.id_batch = batch.id
        WHERE t.id = :id
        `, {
            replacements: {
                id: id
            }
        })
        // console.log(tagihan)
        if (!tagihan) throw ApiError.badRequest('Tagihan not found')
        tagihan = tagihan[0][0]
        res.status(200).json({
            success: true,
            message: 'success get tagihan',
            data: tagihan
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
        let pembayaran
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
            pembayaran = await Pembayaran.create({
                id_tagihan: tagihan.id,
                amount: dp,
                date: new Date(),
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

const getPembayaran = async (req, res, next) => {
    try {
        // const { id_tagihan } = req.params
        // const pembayaran = await Pembayaran.findAll({
        //     where: {
        //         id_tagihan: id_tagihan
        //     }
        // })
        let pembayaran
        let responseMessage
        if (req.query.id_tagihan) {
            pembayaran = await sequelize.query(`
            SELECT pemb.id, u."name" as "murid", b."name" as "batch", t.id as "id_tagihan", pemb.amount, pemb."date" FROM pembayaran as pemb
            JOIN tagihan as t ON pemb.id_tagihan = t.id
            JOIN murid as m ON t.id_murid = m.id
            JOIN users as u ON m.id_user = u.id
            JOIN batch as b ON  m.id_batch = b.id
            WHERE id_tagihan = :id_tagihan
            ;
            `,
                {
                    replacements: {
                        id_tagihan: req.query.id_tagihan
                    }
                })
            pembayaran = pembayaran[0]
            responseMessage = 'success get pembayaran by id_tagihan = ' + req.query.id_tagihan
        } else {
            pembayaran = await sequelize.query(`
            SELECT pemb.id, u."name" as "murid", b."name" as "batch", t.id as "id_tagihan", pemb.amount, pemb."date" FROM pembayaran as pemb
            JOIN tagihan as t ON pemb.id_tagihan = t.id
            JOIN murid as m ON t.id_murid = m.id
            JOIN users as u ON m.id_user = u.id
            JOIN batch as b ON  m.id_batch = b.id
            ;
            `)
            pembayaran = pembayaran[0]
            responseMessage = 'success get pembayaran'
        }

        // if (!pembayaran) throw ApiError.badRequest('Pembayaran not found')

        res.status(200).json({
            success: true,
            message: responseMessage,
            data: pembayaran
        })
    } catch (error) {
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
    getAllTagihan,
    detailTagihan,
    createTagihan,
    updateTagihan,
    createPembayaran,
    getPembayaran,
}