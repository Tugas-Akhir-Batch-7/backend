const cron = require('node-cron');
const { resolve } = require('path');

// cron.schedule('* * * * * *', () => {
//     console.log('running a task every minute')
//     console.log('uyye')
// })
// // const cobaResolve = resolve('controller/cronHandlers/coba.js');
// const cobaResolve= resolve(
//     __dirname,
//     '../controller/cronHandlers/',
//     'coba.js');
// const resolveFunction = require(cobaResolve);
// console.log(resolveFunction())
// resolveFunction();
// console.log(cobaResolve)

// cobaResolve();
// module.exports = cobaResolve
// console.log(resolve(__dirname, '../controller/cronHandlers/hello.js'))


module.exports = {
    initCrons: (config) => {
        Object.keys(config).forEach(key => {
            // console.log('key', key)
            if(cron.validate(config[key].frequency)) {
                cron.schedule(config[key].frequency, () => {
                    const handler = require(resolve(
                        __dirname, // this file dir (helpers forlder)
                        config[key].handler
                    ))
                    handler();
                })
                // .start();
            }
        })

    }
}
