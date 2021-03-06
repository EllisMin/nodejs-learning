const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const errorController = require("./controllers/error");
const db = require("./util/db");

const app = express();

// Set up ejs
app.set("view engine", "ejs");
app.set("views", "06-db/views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// Handle middlewares
app.use("/admin", adminRoutes);
app.use(shopRoutes);

// Handle 404
app.use(errorController.getPageNotFound);

app.listen(3000);
