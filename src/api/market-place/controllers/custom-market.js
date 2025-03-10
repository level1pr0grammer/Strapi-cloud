'use strict';

module.exports = {
  async checkStatus(ctx) {
    try {
      const result = await strapi.service('api::market-place.custom-service').checkAndUpdateStatus();
      ctx.body = result;
    } catch (err) {
      ctx.throw(500, err);
    }
  },
  async SellItem(ctx) {
    try {
      const info = ctx.state.user;
      const order = ctx.request.body.data;
      
      const ExistingItem = await strapi.db.query('api::item.item').findOne({
        select: ['id','name'],
        where: {
          name: order.item
        }
      });
  
      const ExistingInventory = await strapi.db.query('api::inventory.inventory').findOne({
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
          stack_item: { $gte: order.amount},
          user: info.id,
          item: ExistingItem.id
        },
      });
      
      const CurrentAmount = ExistingInventory.stack_item - order.amount;
      
      await strapi.db.transaction(async (transaction) => {
        if (CurrentAmount != 0) {
          await strapi.db.query('api::inventory.inventory').update({
            where: {
              id: ExistingInventory.id
            },
            data: {
              stack_item: CurrentAmount
            },
            transaction
          });

        }else if (CurrentAmount == 0) {
          await strapi.db.query('api::inventory.inventory').delete({
            where: {
              id: ExistingInventory.id
            },
            transaction
          });
        }

        const now = new Date();
        const CreatedOrder = await strapi.db.query('api::market-place.market-place').create({
          data: {
            amount: order.amount,
            publish_date: now,
            seller: info.id,
            item: ExistingItem.id,
            price: order.price
          },
          transaction
        });
        ctx.body = {
          message: `${info.username} is selling ${CreatedOrder.amount} ea of ${ExistingItem.name} for ${CreatedOrder.price} coin`,
        };
      });
    
    } catch (err) {
      ctx.throw(500, err);
    }
  },
  async BuyItem(ctx) {
    try {
      const info = ctx.state.user;
      const WantBuy = ctx.params.id;
  
      const CheckOrder = await strapi.db.query('api::market-place.market-place').findOne({
        select: ['id', 'price', 'amount', 'sell_status'],
        where: {
          documentId: WantBuy,
          seller: { $ne: info.id },
          sell_status: 'pending'
        },
        populate: {
          seller: {
            select: ['id', 'currency', 'username', 'mail_box']
          },
          item: {
            select: ['id', 'name']
          },
        },
      });

      const CurrentCoin = info.currency - CheckOrder.price;
      if (CurrentCoin >= 0) {
        try {
          await strapi.db.transaction(async (transaction) => {
            await strapi.entityService.update(
              "plugin::users-permissions.user",
              info.id,
              {
                data: {
                  currency: CurrentCoin,
                },
              },
                transaction
              );

            const income = CheckOrder.seller.mail_box + CheckOrder.price;
            await strapi.entityService.update(
              "plugin::users-permissions.user",
              CheckOrder.seller.id,
              {
                data: {
                  mail_box: income,
                },
              },
                transaction
              );
      
            const ExistingItem = await strapi.db.query('api::inventory.inventory').findOne({
              select: ['id', 'stack_item', 'documentId'],
              where: {
                user: info.id,
                item: CheckOrder.item.id
              },
            });
      
            if (!ExistingItem) {
              await strapi.db.query('api::inventory.inventory').create({
                data: {
                  item: CheckOrder.item.id,
                  stack_item: CheckOrder.amount,
                  user: info.id
                },
              },
                transaction
              );
            } else {
              const CurrentAmount = CheckOrder.amount + ExistingItem.stack_item;
              await strapi.db.query('api::inventory.inventory').update({
                where: {
                  id: ExistingItem.id
                },
                data: {
                  stack_item: CurrentAmount
                },
              },
                transaction
              );
            }
      
            const now = new Date();
            await strapi.db.query('api::market-place.market-place').update({
              where: {
                documentId: WantBuy
              },
              data: {
                sell_status: 'success',
                buyer: info.id,
                end_date: now
              },
            },
              transaction
            );
      
            ctx.body = {
              message: `${info.username} bought ${CheckOrder.amount} ea of ${CheckOrder.item.name} 
              from ${CheckOrder.seller.username} for ${CheckOrder.price} coin`,
            }
          });
        } catch (err) {
          ctx.throw(500, err)
        }
      }else {
        throw new Error("Not Enough Currency")
      }
    } catch (err) {
      ctx.throw(500, err);
    }
  }
}  