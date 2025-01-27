'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/market-places/fetch',
      handler: 'custom-market.checkStatus',
    },
  ],
};
