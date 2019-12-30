const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const errorController = require("./controllers/error");

const mongoConnect = require("./util/db").mongoConnect;
const User = require("./models/user");

const app = express();

// Set up ejs
app.set("view engine", "ejs");
app.set("views", "08-mongodb/views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.getById("5e09e1204a819ac8afba47fc")
    .then(user => {
      // Adding a new field to req obj; stores sequelize obj
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

// Handle routes
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(errorController.getPageNotFound);

// db connection
mongoConnect(() => {
  // Set prot to whatever is in the environment variable PORT,
  // or 3000 if there's nothing there.
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
  });
});
