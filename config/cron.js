const cron = require('node-cron');

module.exports = () => {
  // ตั้งค่าให้ทำงานทุกๆ 10 นาที
  cron.schedule('*/10 * * * *', async () => {
    try {
      await strapi.service('api::market-place.custom-service').checkAndUpdateStatus();
    } catch (error) {
      console.error('Error in checkAndUpdateStatus:', error);
      //มันerror อะไรสักอย่าง แต่โปรแกรมทำงานได้ปกติ
    }
  });
};