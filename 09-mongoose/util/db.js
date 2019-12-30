const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
// _ is to denote it will be used internally in this file
let _db;

const mongoConnect = callback => {
  // Create connection
  MongoClient.connect(
    "mongodb+srv://Ellis:00000000@cluster0-6s9e0.mongodb.net/shop?retryWrites=true&w=majority",
    { useUnifiedTopology: true }
  )
    .then(client => {
      _db = client.db();
      console.log("Connected to database");
      callback();
    })
    .catch(err => {
      console.log(err);
      throw err;
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw "No database found!";
};

// module.exports = mongoConnect;
exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
