const fs = require("fs");
const path = require("path");
const rootDir = require("../util/path");
const p = path.join(rootDir, "data", "cart.json");

module.exports = class Cart {
  // constructor() {
  //     this.products = [];
  //     this.totalPrice = 0;
  // }

  static addProduct(id, price) {
    // fetch the prev cart
    fs.readFile(p, (err, fileContent) => {
      let cart = { products: [], totalPrice: 0 };
      if (!err) {
        cart = JSON.parse(fileContent);
      }
      // analyze the cart & find the product
      const existingProdIndex = cart.products.findIndex(prod => prod.id === id);
      const existingProd = cart.products[existingProdIndex];
      let updatedProd;
      if (existingProd) {
        updatedProd = { ...existingProd };
        updatedProd.qty = updatedProd.qty + 1;
        // update cart with new quantity
        cart.products = [...cart.products];
        cart.products[existingProdIndex] = updatedProd;
      } else {
        updatedProd = { id: id, qty: 1 };
        // updated cart with new product
        cart.products = [...cart.products, updatedProd];
      }
      cart.totalPrice = cart.totalPrice + +price;
      // write to file
      fs.writeFile(p, JSON.stringify(cart), err => {
        if (err) console.log("ERROR writing cart: " + err);
      });
    });
  }

  static removeProduct(id, prodPrice) {
    fs.readFile(p, (err, fileContent) => {
      // Continue if cart item doesn't exist
      if (err) return;
      // need to parse string, fileContent
      const updatedCart = { ...JSON.parse(fileContent) };
      const product = updatedCart.products.find(prod => prod.id === id);
      if (!product) return;
      const prodQty = product.qty;
      updatedCart.products = updatedCart.products.filter(
        prod => prod.id !== id
      );
      updatedCart.totalPrice = updatedCart.totalPrice - prodPrice * prodQty;
      fs.writeFile(p, JSON.stringify(updatedCart), err => {
        if (err) console.log("ERROR updating cart: " + err);
      });
    });
  }

  static getCart(cb) {
    fs.readFile(p, (err, fileContent) => {
      const cart = JSON.parse(fileContent);
      if (err) {
        cb(null);
      } else {
        cb(cart);
      }
    });
  }
};
