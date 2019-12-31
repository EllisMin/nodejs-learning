const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imgUrl = req.body.imgUrl;
  const description = req.body.description;
  const price = req.body.price;
  const product = new Product({
    title: title,
    imgUrl: imgUrl,
    price: price,
    description: description
  });

  product
    .save()
    .then(result => {
      console.log("Created a product");
      res.redirect("/admin/product-list");
    })
    .catch(err => console.log(err));
};

exports.getEditProduct = (req, res, next) => {
  // Getting query parameter(?edit="true", passed in ejs)
  // returned string "true" if exists in url else undefined
  const editMode = req.query.edit;

  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;

  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product
      });
    })
    .catch(err => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  // Extract id from hidden input in /admin/edit-products.ejs
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedImgUrl = req.body.imgUrl;
  const updatedDesc = req.body.description;
  const updatedPrice = req.body.price;

  // Creating product with updated values
  Product.findById(prodId)
    .then(product => {
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      product.price = updatedPrice;
      product.imgUrl = updatedImgUrl;

      // save() automatically updates in mongoose
      return product.save();
    })
    .then(result => {
      console.log("Updated a product");
      res.redirect("/admin/product-list");
    })
    .catch(err => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  // Use param to extract from url, else use req.body to extract from hidden input's name
  const prodId = req.params.productId;
  Product.findByIdAndRemove(prodId)
    .then(result => {
      console.log("Removed product");
      res.redirect("/admin/product-list");
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render("admin/product-list", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/product-list"
      });
    })
    .catch(err => console.log(err));
};
