'use strict';

/**
 * testkub service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::testkub.testkub');
