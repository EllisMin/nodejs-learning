const fs = require("fs");
const path = require("path");
const PdfDocument = require("pdfkit");

const Product = require("../models/product");
const Order = require("../models/order");

const ITEMS_PER_PAGE = 1;

exports.getIndex = (req, res, next) => {
  // From the href in index
  const page = +req.query.page || 1;
  let totalItems;
  Product.find()
    .countDocuments()
    .then(numProducts => {
      totalItems = numProducts;
      // Gives us products not cursor; to get cursor, use find().cursor()
      return (
        Product.find()
          // skip first x results
          .skip((page - 1) * ITEMS_PER_PAGE)
          // limit data amount that we fetch
          .limit(ITEMS_PER_PAGE)
      );
    })
    .then(products => {
      // console.log(products);///
      res.render("shop/index", {
        prods: products,
        pageTitle: "Home",
        path: "/",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPrevPage: page > 1,
        nextPage: page + 1,
        prevPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
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
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
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
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
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
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect("/cart");
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrders = (req, res, next) => {
  // retrieves orders belong to the user
  Order.find({ "user.userId": req.user._id })
    .then(orders => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postOrder = (req, res, next) => {
  req.user
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
        user: { email: req.user.email, userId: req.user }
      });
      return order.save();
    })
    .then(result => {
      console.log("Created order");
      // clear cart
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then(order => {
      if (!order) {
        return next(new Error("No order found"));
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error("Unauthorized"));
      }
      const invoiceName = "invoice-" + orderId + ".pdf";
      const invoicePath = path.join(
        "11-authentication",
        "data",
        "invoices",
        invoiceName
      );

      // Create file with PDFKit
      const pdfDoc = new PdfDocument();
      res.setHeader("Content-Type", "application/pdf");
      // inline: view on browser; attachment: download
      res.setHeader("Content-Disposition", "inline; filename=" + invoiceName);
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      // Add content to pdf
      pdfDoc.fontSize(26).text("Invoice", {
        underline: true
      });
      pdfDoc.fontSize(14).text("------------------------");
      let totalPrice = 0;
      order.products.forEach(prod => {
        totalPrice += prod.quantity * prod.product.price;
        pdfDoc.text(
          prod.product.title +
            " - " +
            prod.quantity +
            " x $" +
            prod.product.price
        );
      });
      pdfDoc.text("---");
      pdfDoc.fontSize(20).text(`Total Price: $${totalPrice}`);

      pdfDoc.end();

      // Preloading is not optimal for bigger files to read it upon request
      // fs.readFile(invoicePath, (err, data) => {
      //   if (err) {
      //     // default error handling
      //     next(err);
      //   }
      //   res.setHeader("Content-Type", "application/pdf");
      //   // inline: view on browser; attachment: download
      //   res.setHeader(
      //     "Content-Disposition",
      //     "inline; filename=" + invoiceName
      //   );
      //   res.send(data);
      // });

      // Streaming the data instead of preloading
      // const file = fs.createReadStream(invoicePath);
      // res.setHeader("Content-Type", "application/pdf");
      // // inline: view on browser; attachment: download
      // res.setHeader("Content-Disposition", "inline; filename=" + invoiceName);
      // // forward data to response
      // file.pipe(res);
    })
    .catch(err => next(err));
};
