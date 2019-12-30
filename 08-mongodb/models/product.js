const getDb = require("../util/db").getDb;
class Product {
  constructor(title, price, description, imgUrl) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imgUrl = imgUrl;
  }

  save() {
    const db = getDb();
    return db
      .collection("products")
      .insertOne(this)
      .then(result => {
        // console.log(result);
      })
      .catch(err => {
        console.log(err);
      });
  }

  static fetchAll() {
    const db = getDb();
    // find() returns cursor that has each document
    return db
      .collection("products")
      .find()
      .toArray()
      .then(products => {
        // console.log(products);///
        return products;
      })
      .catch(err => {
        console.log(err);
      });
  }
}
module.exports = Product;
