const cron = require('node-cron');

module.exports = () => {
  cron.schedule('*/10 * * * *', async () => {
    try {
      await strapi.service('api::market-place.custom-service').checkAndUpdateStatus();
    } catch (error) {
      console.error('Error in checkAndUpdateStatus:', error);
    }
  });
};