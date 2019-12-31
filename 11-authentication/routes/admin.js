const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin");
const isAuth = require("../middleware/is-auth");

// /admin/add-product => GET
// args in router.get() gets parsed from left to right
router.get("/add-product", isAuth, adminController.getAddProduct);

// /admin/add-product => POST
router.post("/add-product", isAuth, adminController.postAddProduct);

// /admin/product-list => GET
router.get("/product-list", isAuth, adminController.getProducts);

// /admin/edit-product/[id] => GET
router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

// /admin/edit-product/[id] => POST
router.post("/edit-product", isAuth, adminController.postEditProduct);

// // /admin/delete/[id] => POST
router.post(
  "/delete-product/:productId",
  isAuth,
  adminController.postDeleteProduct
);

module.exports = router;
