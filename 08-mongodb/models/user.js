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
    // existing product
    // const cartProduct = this.cart.items.findIndex(cp => {
    //   return cp._id === product._id;
    // });

    const updatedCart = {
      items: [{ productId: new ObjId(product._id), quantity: 1 }]
    };
    const db = getDb();
    // updateOne() returns a promise
    return db.collection("users").updateOne(
      { _id: new ObjId(this._id) },
      // overwrite with updated cart
      { $set: { cart: updatedCart } }
    );
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
