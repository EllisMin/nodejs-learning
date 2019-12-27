
const products = [];

module.exports = class Product {
  constructor(title) {
    this.title = title;
  }

  save() {
    products.push(this);
  }

  // static allows to call this function on Product itself
  static fetchAll() {
    return products;
  }
};
