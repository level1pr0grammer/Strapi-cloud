"use strict";

module.exports = {
  routes: [
    {
      method: "POST",
      path: "/inventories/add",
      handler: "add.add",
    },
    {
      method: "POST",
      path: "/inventories/remove",
      handler: "add.remove"
    },
  ],
};
