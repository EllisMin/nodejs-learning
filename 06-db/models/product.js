const Cart = require("./cart");
const db = require("../util/db");

module.exports = class Product {
  constructor(id, title, imgUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imgUrl = imgUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    // Put VALUES(?,?,?,?) to Avoid sql injection
    // mysql package escape the 2nd arg by parsing and removing them
    return db.execute(
      "INSERT INTO products(title, price, imgUrl, description) VALUES(?, ?, ?, ?)",
      [this.title, this.price, this.imgUrl, this.description]
    );
  }

  static removeById(prodId) {

  }

  // static allows to call this function on Product itself
  static fetchAll() {
    return db.execute("SELECT * FROM products");
  }

  static findById(id, cb) {
    // Use ? to avoid sql injection
    return db.execute('SELECT * FROM products WHERE products.id = ?', [id]);
  }
};
