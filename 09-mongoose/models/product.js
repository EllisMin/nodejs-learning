const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productsSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imgUrl: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    // Giving the reference to User model
    ref: 'User',
    required: true
  }
});

// Product creates products collection
module.exports = mongoose.model("Product", productsSchema);

// const mongodb = require("mongodb");
// const getDb = require("../util/db").getDb;

// class Product {
//   constructor(title, price, description, imgUrl, id, userId) {
//     this.title = title;
//     this.price = price;
//     this.description = description;
//     this.imgUrl = imgUrl;
//     this._id = id ? new mongodb.ObjectId(id) : null;
//     this.userId = userId;
//   }

//   save() {
//     const db = getDb();
//     let dbOp;
//     if (this._id) {
//       // Update product with id; use $set: {title: this.title} to update specific field
//       dbOp = db
//         .collection("products")
//         .updateOne({ _id: this._id }, { $set: this });
//     } else {
//       // Create product
//       dbOp = db.collection("products").insertOne(this);
//     }
//     return dbOp
//       .then(result => {
//         // console.log(result);
//       })
//       .catch(err => {
//         console.log(err);
//       });
//   }

//   static fetchAll() {
//     const db = getDb();
//     // find() returns cursor that has each document
//     return db
//       .collection("products")
//       .find()
//       .toArray()
//       .then(products => {
//         // console.log(products);
//         return products;
//       })
//       .catch(err => {
//         console.log(err);
//       });
//   }
//   static getById(prodId) {
//     const db = getDb();
//     // console.log(prodId);
//     return db
//       .collection("products")
//       .find({ _id: new mongodb.ObjectId(prodId) })
//       .next()
//       .then(product => {
//         // console.log(product);
//         return product;
//       })
//       .catch(err => {
//         console.log(err);
//       });
//   }

//   static removeById(prodId) {
//     const db = getDb();
//     return db
//       .collection("products")
//       .deleteOne({ _id: new mongodb.ObjectId(prodId) })
//       .then(result => {
//         // console.log(result);
//       })
//       .catch(err => {
//         console.log(err);
//       });
//   }
// }
// module.exports = Product;
