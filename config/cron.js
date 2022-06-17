module.exports = {
    // handler key rootnya adalah file helpers/cron-scheduler.js
    // hello: {
    //     frequency: '* * * * * *',
    //     handler: '../controller/cronHandlers/hello'
    // },
    // coba: {
    //     frequency: '* * * * * *',
    //     handler: '../controller/cronHandlers/coba'
    // },
    sendEmailTagihan: {
        frequency: '*/5 * * * * *', //per 1 minute
        handler: '../controller/cronHandlers/sendEmailTagihan'
    }
}