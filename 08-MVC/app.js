// Server with express
const express = require("express");
const bodyParser = require("body-parser");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const path = require("path");
const app = express();
const errorController = require("./controllers/error");

// Set up ejs
app.set("view engine", "ejs");
app.set("views", "08-MVC/views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// Handle middlewares
app.use("/admin", adminRoutes);
app.use(shopRoutes);

// Handle 404
app.use(errorController.getPageNotFound);

app.listen(3000);
