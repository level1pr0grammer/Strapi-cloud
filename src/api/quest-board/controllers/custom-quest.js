module.exports = {
    async GenerateQuest(ctx) {
        try {
            const info = await strapi.entityService.findOne(
                "plugin::users-permissions.user", 
                ctx.state.user.id,{
                populate: {
                   quest_board: {
                    fields: ['id','rank','amount'],
                    populate: {
                        item: {
                            fields: ['id','name','rank'],
                        }
                    }
                  },
                   inventories: {
                    fields: ['id','stack_item'],
                    populate: {
                        item: {
                            fields: ['id','name','rank'],
                        },
                    }
                   },
                },
              });

            if (!info.quest_board){ //START
                const RankD = await strapi.db.query('api::item.item').findMany({
                    where: {
                        rank: {$eq: 'E'}
                    },
                    select: ['id','name','rank'],
                });
                
                const Index = Math.floor(Math.random() * (RankD.length)); 
                const Range = Math.floor(Math.random() * (300-150)) + 150;

                const NewQuest = await strapi.db.query('api::quest-board.quest-board').create({
                populate: {
                        item: {
                            fields: ['id','name','rank'],
                        }
                    },
                data: {
                    amount: Range,
                    item: RankD[Index],
                    owner: ctx.state.user.id 
                    }   
                });

                ctx.body = {
                    message: `Next Quest collect ${RankD[Index].name} amount ${Range} piece for send to DemonLord`,
                    NewQuest
                }
            }else {
                const list_rank = ['E','D','C','B','A','S'];
                const max = [300,200,180,180,150,2];
                const min = [150,150,100,100,50,1];
                const ExistingItem = info.quest_board; // ของที่เควสต้องการ
                const QuestItem = info.inventories; // ของที่เรามี

                for (const i in QuestItem){
                    if (QuestItem[i].item.name == ExistingItem.item.name){ // ของตรงกับที่เควสต้องการ
                        if (ExistingItem.amount <= QuestItem[i].stack_item){ // มีของพอที่จะส่งเควส
                            const New_Index = list_rank.indexOf(info.quest_board.rank) + 1;
                            
                            if (!list_rank[New_Index]) { //END
                                ctx.body = {
                                    message: "SUCCESS",
                                }
            
                            }else { //D-S
                                const RankXX = await strapi.db.query('api::item.item').findMany({
                                    where: {
                                        rank: { $eq: list_rank[New_Index] }
                                    },
                                    select: ['id','name','rank'],
                                });
                                const Index = Math.floor(Math.random() * (RankXX.length)); 
                                const Range = Math.floor(Math.random() * (max[New_Index] - min[New_Index])) + min[New_Index];
                                
                                const NewQuest = await strapi.db.query('api::quest-board.quest-board').update({
                                    where: {
                                        id: info.quest_board.id
                                    },
                                    populate: {
                                        item: {
                                            fields: ['id','name','rank'],
                                        }
                                    },
                                    data: {
                                        amount: Range,
                                        item: RankXX[Index].id,
                                        rank: list_rank[New_Index]
                                        }   
                                    });

                                const remain = QuestItem[i].stack_item - ExistingItem.amount
                                    if (remain >= 1) {
                                      await strapi.db.query('api::inventory.inventory').update({
                                        where: { 
                                          id: QuestItem[i].id 
                                        },
                                        data: {
                                          stack_item: remain,
                                        },
                                      });
                            
                                    } else if (remain == 0) {
                                      await strapi.db.query('api::inventory.inventory').delete({
                                        where: {
                                            id: QuestItem[i].id
                                        },
                                      });
                                    } 
                                
                                ctx.body = {
                                    message: `Next Quest collect ${RankXX[Index].name} amount ${Range} piece for send to DemonLord`,
                                    NewQuest
                                }
                            }
                            
                        }else { //ของไม่พอ
                            const NewQuest = ExistingItem;
                            ctx.body = {
                                message: `Amount Item Not Enough for Quest Require ${ExistingItem.item.name} more ${ExistingItem.amount-QuestItem[i].stack_item}`,
                                NewQuest
                            }
                        }
                    }
                }
            }
        } catch (error) {
            ctx.throw(500,error)
        }
    }, 
}