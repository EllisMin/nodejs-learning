const fs = require("fs");
const path = require("path");
const rootDir = require("../util/path");

const p = path.join(rootDir, "data", "products.json");
const Cart = require("./cart");

const getProductsFromFile = cb => {
  fs.readFile(p, (err, fileContent) => {
    if (err) {
      cb([]);
    } else {
      // Read the file & put into products if exists
      cb(JSON.parse(fileContent));
    }
  });
};

module.exports = class Product {
  constructor(id, title, imgUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imgUrl = imgUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    getProductsFromFile(products => {
      // Update if id already exists
      if (this.id) {
        const existingProdIndex = products.findIndex(
          prod => prod.id === this.id
        );
        const updatedProd = [...products];
        // replace(update)
        updatedProd[existingProdIndex] = this;
        fs.writeFile(p, JSON.stringify(updatedProd), err => {
          if (err) console.log("ERROR saving product: " + err);
        });
      } else {
        // Create id on product that doesn't exist
        this.id = new Date().getTime().toString();
        // Write the product into file
        products.push(this);
        fs.writeFile(p, JSON.stringify(products), err => {
          if (err) console.log("ERROR saving product: " + err);
        });
      }
    });
  }

  static removeById(prodId) {
    if (prodId) {
      getProductsFromFile(products => {
        const index = products.findIndex(prod => prod.id === prodId);
        products.splice(index, 1);
        // Alternative
        // const updatedProducts = products.filter(prod => prod.id !== id);

        const product = products.find(prod => prod.id === id);
        fs.writeFile(p, JSON.stringify(products), err => {
          if (err) console.log("ERROR removing product: " + err);
          else {
            // Also remove from cart
            Cart.removeProduct(prodId, product.price);
          }
        });
      });
    }
  }

  // static allows to call this function on Product itself
  static fetchAll(cb) {
    getProductsFromFile(cb);
  }

  static findById(id, cb) {
    getProductsFromFile(products => {
      const prod = products.find(p => p.id === id);
      // Returns object to be used in argument that's passed into this function, not product
      cb(prod);
    });
  }
};
