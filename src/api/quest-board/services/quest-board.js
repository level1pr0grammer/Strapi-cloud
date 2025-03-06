'use strict';

/**
 * quest-board service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::quest-board.quest-board');
