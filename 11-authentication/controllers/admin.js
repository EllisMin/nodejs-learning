const Product = require("../models/product");
const { validationResult } = require("express-validator/check");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: []
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imgUrl = req.body.imgUrl;
  const description = req.body.description;
  const price = req.body.price;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/edit-product",
      editing: false,
      product: {
        title: title,
        imgUrl: imgUrl,
        price: price,
        description: description,
      },
      hasError: true,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  const product = new Product({
    title: title,
    imgUrl: imgUrl,
    price: price,
    description: description,
    userId: req.user
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
        product: product,
        hasError: false,
        errorMessage: null,
        validationErrors: []
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

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: true,
      product: {
        title: updatedTitle,
        imgUrl: updatedImgUrl,
        price: updatedPrice,
        description: updatedDesc,
        _id: prodId
      },
      hasError: true,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  // Creating product with updated values
  Product.findById(prodId)
    .then(product => {
      if (product.userId.toString() !== req.user._id.toString()) {
        console.log("Not allowed to edit product"); ///
        return res.redirect("/");
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      product.price = updatedPrice;
      product.imgUrl = updatedImgUrl;

      // save() automatically updates in mongoose with updated fields above
      return product.save().then(result => {
        console.log("Updated a product");
        res.redirect("/admin/product-list");
      });
    })

    .catch(err => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  // Use param to extract from url, else use req.body to extract from hidden input's name
  const prodId = req.params.productId;
  Product.deleteOne({ _id: prodId, userId: req.user._id })
    .then(result => {
      if (result.deletedCount === 1) {
        console.log("Removed product");
        res.redirect("/admin/product-list");
      }
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getProducts = (req, res, next) => {
  Product.find({ userId: req.user._id })
    // target specific fields of PRODUCT. - to denote exclusion
    // .select('title price -_id')
    // .populate() is mongoose utility fcn to include all of other user's information
    // instead of having just userId. 2nd arg selects fields of USER similar to select()
    // .populate("userId", 'name')
    .then(products => {
      // console.log(products); ///
      res.render("admin/product-list", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/product-list"
      });
    })
    .catch(err => console.log(err));
};
