'use strict';

const path = require("path");

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
  ],
};
