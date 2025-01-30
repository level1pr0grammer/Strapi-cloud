'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/market-places/fetch',
      handler: 'custom-market.checkStatus',
    },
    {
      method: 'POST',
      path: '/market-places/sell',
      handler: 'custom-market.SellItem',
    },
    {
      method: 'GET',
      path: '/market-places/:id/buy',
      handler: 'custom-market.BuyItem',
    },
  ],
};
