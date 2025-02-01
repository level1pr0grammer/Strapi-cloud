'use strict';

module.exports = {
  async add(ctx) {
    try {
      const info = ctx.state.user;
      const WantAdd = ctx.request.body.data;

      const existingItem = await strapi.db.query('api::item.item').findOne({
        select: ['id'],
        where: { 
          name: WantAdd.item 
        },
      });

      const existingInventory = await strapi.db.query('api::inventory.inventory').findOne({
        select: ['id','stack_item'],
        populate: {
          item: {
            select: ['id']
          },
          user: {
            select: ['id']
          },
        },
        where: {
          item: existingItem.id,
          user: info.id
        },
      });

      if (existingInventory) {
        const updatedStackItem = existingInventory.stack_item + WantAdd.stack_item;
        await strapi.db.query('api::inventory.inventory').update({
          where: { 
            id: existingInventory.id 
          },
          data: {
            stack_item: updatedStackItem,
          },
        });

      } else {
        await strapi.db.query('api::inventory.inventory').create({
          data: {
              user: info.id, 
              item: existingItem.id, 
              stack_item: WantAdd.stack_item,
          },
        });
      }
      ctx.body = {
        message: `${info.username} received ${WantAdd.stack_item} ea of ${WantAdd.item}`,
    };
    } catch (err) {
      ctx.throw(500, err);
    }
  },
  async remove(ctx) {
    try {
        const info = ctx.state.user;
        const WantRemove = ctx.request.body.data;
  
        const existingItem = await strapi.db.query('api::item.item').findOne({
          select: ['id'],
          where: { 
            name: WantRemove.item 
          }, 
        });

        const existingInventory = await strapi.db.query('api::inventory.inventory').findOne({
          select: ['id','stack_item'],
          populate: {
            item: {
              select: ['id']
            },
            user: {
              select: ['id']
            },
          },
          where: {
            item: existingItem.id,
            user: info.id
          },
        });

        const remain = existingInventory.stack_item - WantRemove.stack_item
        if (remain >= 1) {
          await strapi.db.query('api::inventory.inventory').update({
            where: { 
              id: existingInventory.id 
            },
            data: {
              stack_item: remain,
            },
          });

        } else if (remain == 0) {
          await strapi.db.query('api::inventory.inventory').delete({
            where: {
                id: existingInventory.id
            },
          });
        } 
        ctx.body = {
          message: `${info.username} took out ${WantRemove.stack_item} ea of ${WantRemove.item} from the bag`,
        };
    } catch (err){
        ctx.throw(500, err);
    }
  }
};
