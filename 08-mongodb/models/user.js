const mongodb = require("mongodb");
const ObjId = mongodb.ObjectId;
const getDb = require("../util/db").getDb;

class User {
  constructor(username, email) {
    this.name = username;
    this.email = email;
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
