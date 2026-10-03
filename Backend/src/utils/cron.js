const schedule = require('node-schedule');
const logger = require('./logger');

// Daily Topic Cron
schedule.scheduleJob('0 0 * * *', () => {
    logger.info('Running daily topic generator');
    // Save to DB or emit event
});
