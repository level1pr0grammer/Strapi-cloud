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
          message: `${info.username} took out ${WantRemove.stack_item} ea of ${WantRemove.item} from the bag`
        };
    } catch (err){
        ctx.throw(500, err);
    }
  },
  async save(ctx) {
    try {
      const info = await strapi.entityService.findOne(
        "plugin::users-permissions.user", 
        ctx.state.user.id,{
        select: ['id','username','currency'],  
        populate: {
          inventories: {
            fields: ['id','stack_item'],
            populate: {
              item: {
                fields: ['id','name']
              },
            },
          },
        },
      });
      const WantSave = ctx.request.body.data;

      const PastAmountItem = info.inventories.length;
      const CurrentItemName = WantSave.inventory.name; // list item name in current
      const CurrentAmountItem = CurrentItemName.length;  
      const StackItem = WantSave.inventory.stack_item; // list stack in current

      if (CurrentAmountItem == StackItem.length) {
        for (let i = 0; i < PastAmountItem; i++) {
          let isHas = false;
          for (let j = 0; j < CurrentAmountItem; j++) {
            isHas = info.inventories[i].item.name == CurrentItemName[j];
            if (isHas) { break; }
          }
          if (!isHas) {
            await strapi.db.query('api::inventory.inventory').delete({
              where: {
                id: info.inventories[i].id
              }
            });
          }
        }
        for (let i = 0; i < CurrentAmountItem; i++) {
          const ExistingItem = await strapi.db.query('api::item.item').findOne({
            select: ['id','name'],
            where: {
              name: CurrentItemName[i]
            },
          });

          let HaveItem = false; 
          for (let j = 0; j < PastAmountItem; j++) {
            HaveItem = info.inventories[j].item.name == ExistingItem.name;
            if (HaveItem) {
              break;
            }
          }
          
          const CurrentStack = StackItem[i];
          if (!HaveItem) {
            await strapi.db.query('api::inventory.inventory').create({
              data: {
                stack_item: CurrentStack,
                item: ExistingItem.id,
                user: info.id
              },
            });
          }else {
            await strapi.db.query('api::inventory.inventory').update({
              where: {
                user: info.id,
                item: ExistingItem.id
              },
              data: {
                stack_item: CurrentStack
              }
            });
          } 
        }
        await strapi.entityService.update(
          "plugin::users-permissions.user", 
          info.id,{
          data: {
            currency: WantSave.currency
          }
        });
      }
      ctx.body = {
        message:`game save successfully`
      }
    } catch (error) {
      ctx.throw(500, error);
    }
  },
  async load(ctx) {
    try {
      const info = await strapi.entityService.findOne(
        "plugin::users-permissions.user", 
        ctx.state.user.id,{
        select: ['id','currency'],  
        populate: {
          inventories: {
            fields: ['id','stack_item'],
            populate: {
              item: {
                fields: ['id','name','type']
              },
            },
          },
        },
      });
      
      ctx.send(info);
    } catch (error) {
      ctx.throw(500, error);
    }
  },
  async currencyupdate(ctx) {
    try {
      await strapi.db.transaction(async (transaction) => {
        const info = await strapi.db.query('plugin::users-permissions.user').findOne({
          where: { id: ctx.state.user.id },
          select: ['id', 'currency', 'mail_box'],
          transaction,
        });
  
        if (!info) {
          throw new Error('User not found');
        }
  
        const CurrentCoin = info.currency + info.mail_box;
  
        const {patch} = await strapi.db.query('plugin::users-permissions.user').update({
          where: { id: ctx.state.user.id, mail_box: info.mail_box},
          data: {
            currency: CurrentCoin,
            mail_box: 0,
          },
          transaction,
        });
        
        if (patch === 0){
          throw new Error('mail_box conflict: try again!');
        } 

        ctx.body = {
          message: `currency is ${CurrentCoin}`,
          currency: CurrentCoin
        };
      });
    } catch (error) {
      ctx.throw(500, error);
    }
  },
};
