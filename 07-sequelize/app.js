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
  // force overwrites table
  .sync({ force: true })
  .then(result => {
    // console.log(result);
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });
