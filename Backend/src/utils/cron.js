const schedule = require('node-schedule');
const logger = require('./logger');
const AdminConfig = require('../modules/admin/models/adminConfig.model');
const { getIO } = require('../../config/socket');

const TOPICS = [
  "Roast my coding skills",
  "React vs Angular",
  "Tabs vs Spaces",
  "Why Vim is better than VSCode",
  "Web3 is just a buzzword",
  "AI will take our jobs",
  "JavaScript is a terrible language",
  "Python is too slow"
];

// Daily Topic Cron
schedule.scheduleJob('0 0 * * *', async () => {
    logger.info('Running daily topic generator');
    try {
        const randomIndex = Math.floor(Math.random() * TOPICS.length);
        const newTopic = TOPICS[randomIndex];
        
        await AdminConfig.findOneAndUpdate(
            { key: 'daily_topic' },
            { value: newTopic, updatedAt: new Date() },
            { upsert: true, new: true }
        );
        
        logger.info(`New daily topic set: ${newTopic}`);
        
        const io = getIO();
        if (io) {
            io.to('lobby').emit('daily_topic_updated', { topic: newTopic });
        }
    } catch (error) {
        logger.error('Failed to generate daily topic', { message: error.message });
    }
});
