const express = require("express");
const path = require("path");

const router = express.Router();
const rootDir = require("../util/path");
const adminData = require("./admin");

router.get("/", (req, res, next) => {
  // NOT RECOMMENDED: adminData.product is SHARED in NodeJS server; shared across all users
  // console.log(adminData.products);
  // res.sendFile(path.join(rootDir, "views", "shop.html"));

  const products = adminData.products;
  // Using default engine 'pug' defined in app.js
  res.render("shop", { prods: products, docTitle: "Shop" }); // 2nd parm passes in data
});

module.exports = router;
