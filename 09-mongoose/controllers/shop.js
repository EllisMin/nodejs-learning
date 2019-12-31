const Product = require("../models/product");

exports.getIndex = (req, res, next) => {
  // Gives us products not cursor; to get cursor, use find().cursor()
  Product.find()
    .then(products => {
      // console.log(products);///
      res.render("shop/index", {
        prods: products,
        pageTitle: "Home",
        path: "/"
      });
    })
    .catch(err => console.log(err));
};

exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {
      // console.log(products); ///
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "Shop",
        path: "/products"
      });
    })
    .catch(err => console.log(err));
};

exports.getProduct = (req, res, next) => {
  // productId's from route url; product/:productId
  const prodId = req.params.productId;
  // findById provided by mongoose which also parse prodId to ObjectId
  Product.findById(prodId).then(product => {
    res.render("shop/product-detail", {
      product: product,
      pageTitle: product.title,
      path: "/products"
    });
  });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate() // returns promise
    .then(user => {
      const products = user.cart.items;
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postCart = (req, res, next) => {
  // Extract product id from hidden input in includes/add-to-cart.ejs
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      // console.log(result);
      res.redirect("/cart");
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeItemFromCart(prodId)
    .then(result => {
      res.redirect("/cart");
    })
    .catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
  req.user
    .getOrders()
    .then(orders => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders
      });
    })
    .catch(err => console.log(err));
};

exports.postOrder = (req, res, next) => {
  req.user
    .addOrder()
    .then(result => {
      res.redirect("/orders");
    })
    .catch(err => console.log(err));
};
