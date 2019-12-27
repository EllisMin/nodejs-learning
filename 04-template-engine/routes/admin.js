const express = require("express");
const router = express.Router();

const products = [];

// /admin/add-product => GET
router.get("/add-product", (req, res, next) => {
  // res.sendFile(path.join(rootDir, "views", "add-product.html"));

  // Using templating engine
  // res.render("add-product", {
  //   pageTitle: "Add Product",
  //   path: "/admin/add-product"
  // });

  // For hbs & ejs
  res.render("add-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    activeAddProduct: true,
    productCSS: true
  });
});

// /admin/add-product => POST
router.post("/add-product", (req, res, next) => {
  products.push({ title: req.body.title });
  res.redirect("/");
});

exports.routes = router;
exports.products = products;
