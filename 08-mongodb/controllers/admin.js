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
  // Having relation allows to create new associated obj to User
  req.user
    .createProduct({
      title: title,
      price: price,
      imgUrl: imgUrl,
      description: description
      // createProduct() adds new id without having to set userId: req.user.id
    })
    .then(result => {
      // console.log(result);
      console.log("Created a product"); ///
      res.redirect("/admin/product-list");
    })
    .catch(err => console.log(err));
};

// exports.getEditProduct = (req, res, next) => {
//   // Getting query parameter(?edit="true", passed in ejs)
//   // returned string "true" if exists in url else undefined
//   const editMode = req.query.edit;

//   if (!editMode) {
//     return res.redirect("/");
//   }
//   const prodId = req.params.productId;

//   req.user
//     .getProducts({ where: { id: prodId } })
//     .then(products => {
//       const product = products[0];
//       if (!product) {
//         return res.redirect("/");
//       }
//       res.render("admin/edit-product", {
//         pageTitle: "Edit Product",
//         path: "/admin/edit-product",
//         editing: editMode,
//         product: product
//       });
//     })
//     .catch(err => console.log(err));
// };

// exports.postEditProduct = (req, res, next) => {
//   // Extract id from hidden input in /admin/edit-products.ejs
//   const prodId = req.body.productId;
//   const updatedTitle = req.body.title;
//   const updatedImgUrl = req.body.imgUrl;
//   const updatedDesc = req.body.description;
//   const updatedPrice = req.body.price;

//   Product.findByPk(prodId)
//     .then(product => {
//       product.title = updatedTitle;
//       product.imgUrl = updatedImgUrl;
//       product.description = updatedDesc;
//       product.price = updatedPrice;
//       // Saves to db if doesn't exist otherwise updates it
//       return product.save();
//     })
//     .then(result => {
//       console.log("Updated a product"); ///
//       res.redirect("/admin/product-list");
//     })
//     .catch(err => console.log(err));
// };

// exports.postDeleteProduct = (req, res, next) => {
//   // Use param to extract from url, else use req.body to extract from hidden input's name
//   const prodId = req.params.productId;
//   Product.findByPk(prodId)
//     .then(product => {
//       return product.destroy();
//     })
//     .then(result => {
//       console.log("Destroyed product");
//       res.redirect("/admin/product-list");
//     })
//     .catch(err => console.log(err));

//   // Alternative:
//   // Product.destroy({ where: { id: prodId } })
//   //   .then(() => {
//   //     console.log("Destroyed product");
//   //     res.redirect("/admin/product-list");
//   //   })
//   //   .catch(err => console.log(err));
// };

// exports.getProducts = (req, res, next) => {
//   // Find all records (SELECT)
//   req.user
//     .getProducts()
//     .then(products => {
//       res.render("admin/product-list", {
//         prods: products,
//         pageTitle: "Admin Products",
//         path: "/admin/product-list"
//       });
//     })
//     .catch(err => console.log(err));
// };
