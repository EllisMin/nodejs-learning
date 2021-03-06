const express = require("express");
const router = express.Router();
const adminData = require("./admin");

router.get("/", (req, res, next) => {
  // NOT RECOMMENDED: adminData.product is SHARED in NodeJS server; shared across all users
  // console.log(adminData.products);
  // res.sendFile(path.join(rootDir, "views", "shop.html"));

  const products = adminData.products;
  // Using default engine, uses extension defined in app.js
  // res.render("shop", { prods: products, pageTitle: "Shop", path: "/" }); // 2nd parm passes in data

  // For hbs & ejs
  res.render("shop", {
    prods: products,
    pageTitle: "Shop",
    path: "/",
    hasProducts: products.length > 0,
    activeShop: true
  }); // 2nd parm passes in data
});

module.exports = router;
