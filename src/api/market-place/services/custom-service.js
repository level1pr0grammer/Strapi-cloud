'use strict';

module.exports = {
  async checkAndUpdateStatus() {
    try {
      const entries = await strapi.db.query('api::market-place.market-place').findMany({
        where: { sell_status: { $eq: 'pending' }},
        select: ['publish_date', 'end_date', 'sell_status', 'id'],
      });

      const uniqueEntries = Array.from(
        new Map(entries.map((entry) => [entry.id, entry])).values()
      );
      
      for (const entry of uniqueEntries) {

        const now = new Date(); 
        const publishDate = new Date(entry.publish_date); 
        
        const timeDifference = now - publishDate; 
        const oneDayInMs = 24 * 60 * 60 * 1000; 

        if (timeDifference > oneDayInMs) {
          console.log("Status updated order existing older than 1 day.");
          await strapi.db.query('api::market-place.market-place').update({
            where: { id: entry.id },
            data: { sell_status: 'fail' },
          });
        }
      }

    } catch (err) {
      strapi.log.error('Error updating Market Place status:', err);
      throw new Error('Failed to update status.');
    }
  },
};
