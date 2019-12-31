const Product = require("../models/product");
const Order = require("../models/order");

exports.getIndex = (req, res, next) => {
  // Gives us products not cursor; to get cursor, use find().cursor()
  Product.find()
    .then(products => {
      // console.log(products);///
      res.render("shop/index", {
        prods: products,
        pageTitle: "Home",
        path: "/",
        isAuthenticated: req.session.isLoggedIn
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
        path: "/products",
        isAuthenticated: req.session.isLoggedIn
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
      path: "/products",
      isAuthenticated: req.session.isLoggedIn
    });
  });
};

exports.getCart = (req, res, next) => {
  req.session.user
    .populate("cart.items.productId")
    .execPopulate() // returns promise
    .then(user => {
      const products = user.cart.items;
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
        isAuthenticated: req.session.isLoggedIn
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
      return req.session.user.addToCart(product);
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
  req.session.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect("/cart");
    })
    .catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
  // retrieves orders belong to the user
  Order.find({ "user.userId": req.session.user._id })
    .then(orders => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => console.log(err));
};

exports.postOrder = (req, res, next) => {
  req.session.user
    .populate("cart.items.productId")
    .execPopulate()
    .then(user => {
      const products = user.cart.items.map(i => {
        // user spread operator to save all product fields.
        // _doc returns just the data excluding meta data
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        products: products,
        user: { name: user.name, userId: user._id }
      });
      return order.save();
    })
    .then(result => {
      console.log("created order");
      // clear cart
      return req.session.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch(err => {
      console.log(err);
    });
};
