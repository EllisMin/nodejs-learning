const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const errorController = require("./controllers/error");
const sequelize = require("./util/db");
// Import models
const Product = require("./models/product");
const User = require("./models/user");

const app = express();

// Set up ejs
app.set("view engine", "ejs");
app.set("views", "07-sequelize/views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// Giving app access to user
app.use((req, res, next) => {
  User.findByPk(1)
    .then(user => {
      // Adding a new field to req obj; stores sequelize obj
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

// Handle middlewares
app.use("/admin", adminRoutes);
app.use(shopRoutes);

// Handle 404
app.use(errorController.getPageNotFound);

// Creating relations; onDelete: Deletion of user also deletes product
// As a result, it creates userId column in product
Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Product); // Optional but is to make it more clear

// CREATE TABLE that's stored in SQL server
sequelize
  .sync()
  .then(result => {
    return User.findByPk(1);
    // console.log(result);
  })
  .then(user => {
    // Creating dummy user
    if (!user) {
      return User.create({ name: "Ellis", email: "test@test.test" });
    }
    return Promise.resolve(user); // Promise.resolve() is optional
  })
  .then(user => {
    // console.log(user);
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });
