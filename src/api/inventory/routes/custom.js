"use strict";

module.exports = {
  routes: [
    {
      method: "POST",
      path: "/inventories/add",
      handler: "custom-inventory.add",
    },
    {
      method: "POST",
      path: "/inventories/remove",
      handler: "custom-inventory.remove"
    },
    {
      method: "POST",
      path: "/save",
      handler: "custom-inventory.save"
    },
    {
      method: "GET",
      path: "/load",
      handler: "custom-inventory.load"
    },
  ],
};
