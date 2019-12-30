const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin");

// /admin/add-product => GET
router.get("/add-product", adminController.getAddProduct);

// /admin/add-product => POST
router.post("/add-product", adminController.postAddProduct);

// /admin/product-list => GET
router.get("/product-list", adminController.getProducts);


// /admin/edit-product/[id] => GET
router.get("/edit-product/:productId", adminController.getEditProduct);

// /admin/edit-product/[id] => POST
router.post("/edit-product", adminController.postEditProduct);

// /admin/delete/[id] => POST
router.post("/delete-product/:productId", adminController.postDeleteProduct);

module.exports = router;
