'use strict';

/**
 * market-place service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::market-place.market-place');
