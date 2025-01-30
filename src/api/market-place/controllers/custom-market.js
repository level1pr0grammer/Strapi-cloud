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
      const order = ctx.request.body.data;
      
      const ItemInInventory = await strapi.db.query('api::inventory.inventory').findOne({
        where: { 
          stack_item: { $gte: order.amount},
          user: order.seller,
          item: order.item
        },
      });
      
      if (!ItemInInventory) {
        ctx.throw(888, 'Players are selling items that they do not have or that exceed the quantity they have.');
      
      }else {
        const CurrentAmount = ItemInInventory.stack_item - order.amount;
        if (CurrentAmount != 0) {
          const CurrentInventory = await strapi.db.query('api::inventory.inventory').update({
            where: {
              user: order.seller,
              item: order.item
            },
            data: {
              stack_item: CurrentAmount
            },
          });
          ctx.body = {
            message: 'Inventory updated successfully',
            marketPlace: CurrentInventory,
          };

        }else if (CurrentAmount == 0) {
          await strapi.db.query('api::inventory.inventory').delete({
            where: {
              user: order.seller,
              item: order.item
            },
          });
          ctx.body = {
            message: 'The item has been sold',
          };
        }else {
          ctx.throw(888, 'Players are selling items that they do not have or that exceed the quantity they have.');
        }

        const now = new Date();
        const CreatedOrder = await strapi.db.query('api::market-place.market-place').create({
          data: {
            amount: order.amount,
            publish_date: now,
            seller: order.seller,
            item: order.item,
            price: order.price
          },
        });

        ctx.body = {
          message: 'Create order successfully',
          marketPlace: CreatedOrder,
        };
      }

    } catch (err) {
      ctx.throw(500, err);
    }
  },
  async BuyItem(ctx) {
    const info = ctx.state.user;
    const WantBuy = ctx.params.id;
    
    try {
    const CheckOrder = await strapi.db.query('api::market-place.market-place').findOne({
      populate: ['seller','item'],
      where: {
        id: WantBuy,
        seller: { $ne : info.id },
        sell_status: 'pending'
      },
    });

    const CurrentCoin = info.currency - CheckOrder.price;
    if (CurrentCoin >= 0) {
      await strapi.entityService.update(
        "plugin::users-permissions.user",
        info.id,
        {
          data : {
            currency: CurrentCoin,
          }
        }
      );
      
      const income = CheckOrder.seller.currency + CheckOrder.price;
      await strapi.entityService.update(
        "plugin::users-permissions.user",
        CheckOrder.seller.id,
        {
          data: {
            currency: income,
          }
        }
      );

      const ExistingItem = await strapi.db.query('api::inventory.inventory').findOne({
        where: {
          user: info.id,
          item: CheckOrder.item.id
        },
      });

      if (!ExistingItem){
        await strapi.db.query('api::inventory.inventory').create({
          data: {
            item: CheckOrder.item.id,
            stack_item: CheckOrder.amount,
            user: info.id
          }
        }); 
      } else {
        const CurrentAmount = CheckOrder.amount + ExistingItem.stack_item;
        await strapi.db.query('api::inventory.inventory').update({
          where: {
            user: info.id,
            item: CheckOrder.item.id
          },
          data: {
            stack_item: CurrentAmount
          },
        });
      }
      const now = new Date();
      await strapi.db.query('api::market-place.market-place').update({
        where: {
          id: WantBuy
        },
        data: {
          sell_status: 'success',
          buyer: info.id,
          end_date: now
        },
      });
      ctx.body = {
        message: 'Buy item successfully',
        CurrentCurrency: info.currency,
      }
    }
  }catch(err) {
    ctx.throw(888, 'Player currency is not enough to buy this');
    }
  },
};