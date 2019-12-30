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
    if (!this.cart.items || !this.cart) {
      this.cart = { items: [] };
    }
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
      // selects which one to update
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

  removeItemFromCart(prodId) {
    // filter() returns array that passes condition
    const updatedCartItems = this.cart.items.filter(item => {
      return item.productId.toString() !== prodId.toString();
    });
    const db = getDb();
    return db
      .collection("users")
      .updateOne(
        { _id: new ObjId(this._id) },
        { $set: { cart: { items: updatedCartItems } } }
      );
  }

  // adds cart to orders & empty cart
  addOrder() {
    const db = getDb();
    return this.getCart()
      .then(products => {
        const order = {
          // needs a snapshot of product, not reference
          // i.e. when price of product change, it should remain same in orders page
          items: products,
          user: {
            _id: new ObjId(this._id),
            name: this.name
          }
        };
        return db.collection("orders").insertOne(order);
      })
      .then(result => {
        // clear cart
        this.cart = { items: [] };
        return db
          .collection("users")
          .updateOne(
            { _id: new ObjId(this._id) },
            { $set: { cart: { items: [] } } }
          );
      });
  }

  getOrders() {
    const db = getDb();
    // retrieve orders that matches user id
    return db
      .collection("orders")
      .find({ "user._id": new ObjId(this._id) })
      .toArray();
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
