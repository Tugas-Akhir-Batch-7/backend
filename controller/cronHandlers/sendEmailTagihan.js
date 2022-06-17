const Tagihan = require('../../db/models').Tagihan;
const { mail, mailOptions } = require('../../model/mail')

module.exports = async () => {

    const dataTagihan = await Tagihan.findAll({})
    // console.log(dataTagihan.id)
    const testEmail = [
        'azizwkwkwk@gmail.com',
        'babazdo123@gmail.com'
    ]
    testEmail.forEach(async (email) => {
        mailOptions.subject = "Tagihan Bootcamp"
        mailOptions.to = email
        mailOptions.text = `test email tagihan`
        mail.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log(err)
                throw 'error kirim email'
            } else {
                console.log('Email Send to: ' + info.response)
            }
        })
    })

    console.log('coba')
}