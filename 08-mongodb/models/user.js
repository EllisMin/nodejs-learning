const mongodb = require("mongodb");
const ObjId = mongodb.ObjectId;
const getDb = require("../util/db").getDb;

class User {
  constructor(username, email, cart, id) {
    this.name = username;
    this.email = email;
    this.cart = cart; // {items: []}
    this._id = id;
  }

  save() {
    const db = getDb();

    return db
      .collection("users")
      .insertOne(this)
      .then(result => {
        // console.log(result);
      })
      .catch(err => {
        console.log(err);
      });
  }

  addToCart(product) {
    // used to check if product already exists; if yes, updated quantity
    const cartProductIndex = this.cart.items.findIndex(cp => {
      return cp.productId.toString() === product._id.toString();
    });
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];
    // product already exists
    if (cartProductIndex >= 0) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      updatedCartItems.push({
        productId: new ObjId(product._id),
        quantity: newQuantity
      });
    }

    const updatedCart = {
      items: updatedCartItems
    };
    const db = getDb();
    // updateOne() returns a promise
    return db.collection("users").updateOne(
      { _id: new ObjId(this._id) },
      // overwrite with updated cart
      { $set: { cart: updatedCart } }
    );
  }

  getCart() {
    const db = getDb();
    const productIds = this.cart.items.map(item => {
      return item.productId;
    });
    // find products in cart and return them
    return db
      .collection("products")
      .find({ _id: { $in: productIds } })
      .toArray()
      .then(products => {
        return products.map(p => {
          return {
            ...p,
            quantity: this.cart.items.find(i => {
              return i.productId.toString() === p._id.toString();
            }).quantity
          };
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  static getById(userId) {
    const db = getDb();
    return (
      db
        .collection("users")
        // Use findOne() when you're sure that ret obj is one element.
        // It will return obj instead of cursor; not require to use next()
        .findOne({ _id: new ObjId(userId) })
        .then(user => {
          // console.log(user);
          return user;
        })
        .catch(err => {
          console.log(err);
        })
    );
  }
}

module.exports = User;
