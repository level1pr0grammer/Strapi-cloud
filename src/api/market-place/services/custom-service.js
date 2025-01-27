'use strict';

module.exports = {
  async checkAndUpdateStatus() {
    try {
      // ดึงข้อมูลทั้งหมดใน Market Place ที่มีสถานะ "pending"
      const entries = await strapi.db.query('api::market-place.market-place').findMany({
        where: { sell_status: { $eq: 'pending' }},
        select: ['publish_date', 'end_date', 'sell_status', 'id'],
      });

      const uniqueEntries = Array.from(
        new Map(entries.map((entry) => [entry.id, entry])).values()
      );
      
      for (const entry of uniqueEntries) {
        // ลูปเช็คความต่างของเวลาในแต่ละ entry

        const now = new Date(); //เวลาปัจจุบัน type object
        const publishDate = new Date(entry.publish_date); //ทำให้ publish_date เป็นเวลา type object
        
        // คำนวณความแตกต่างระหว่างวันที่
        const timeDifference = now - publishDate; // หาความต่างของเวลาต่างในหน่วย milliseconds
        const oneDayInMs = 24 * 60 * 60 * 1000; // 1 วันใน milliseconds

        if (timeDifference > oneDayInMs) {

          // หากเกิน 1 วัน ให้เปลี่ยน status เป็น fail
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
