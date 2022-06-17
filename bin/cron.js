const config = require('../config/cron');
const scheduler = require('../helpers/cron-scheduler');

// console.log(scheduler)


scheduler.initCrons(config);