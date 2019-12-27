const fs = require("fs");
const path = require("path");
const rootDir = require("../util/path");

const p = path.join(rootDir, "data", "products.json");

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
  constructor(title, imgUrl, description, price) {
    this.id = new Date().getTime().toString();
    this.title = title;
    this.imgUrl = imgUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    getProductsFromFile(products => {
      // Write the product into file
      products.push(this);
      fs.writeFile(p, JSON.stringify(products), err => {
        console.log("ERROR: " + err);
      });
    });
  }

  // static allows to call this function on Product itself
  static fetchAll(cb) {
    getProductsFromFile(cb);
  }

  static findById(id, cb) {
    getProductsFromFile(products => {
      const prod = products.find(p => p.id === id);
      cb(prod);
    });
  }
};
