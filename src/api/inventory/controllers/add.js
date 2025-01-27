'use strict';

/**
 * inventory controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::inventory.inventory', ({ strapi }) => ({
  async add(ctx) {
    try {
      const { user, item, stack_item } = ctx.request.body.data;

      // ดึงข้อมูล item จาก database ผ่าน id
      const existingItem = await strapi.db.query('api::item.item').findOne({
        where: { id: item },
      });

      if (!existingItem) {
        ctx.throw(404, 'Item not found');
      }

      // ดึงข้อมูล inventory ทั้งหมดของ user
      const showInventory = await strapi.db.query('api::inventory.inventory').findMany({
        populate: ['item', 'user'], // populate เฉพาะ relations ที่จำเป็น
      });

      const existingInventory = showInventory.find(
        (inventory) =>
          inventory.item?.id === item && inventory.user?.id === user
      );

      if (existingInventory) {
        // อัปเดต stack_item ของ inventory ที่มีอยู่
        const updatedStackItem = existingInventory.stack_item + stack_item;
        const updatedInventory = await strapi.db.query('api::inventory.inventory').update({
          where: { id: existingInventory.id },
          data: {
            stack_item: updatedStackItem,
          },
        });

        ctx.body = {
          message: 'Inventory updated successfully',
          inventory: updatedInventory,
        };
      } else {
        // สร้าง inventory ใหม่
        console.log(existingItem.id);
        const newInventory = await strapi.db.query('api::inventory.inventory').create({
          data: {
              user: user, // ใช้ ID ของ user
              item: existingItem.id, // ใช้ ID ของ item
              stack_item: stack_item,
          },
        });

        ctx.body = {
          message: 'New inventory created successfully',
          inventory: newInventory,
        };
      }
    } catch (err) {
      ctx.throw(500, err);
    }
  },
}));
