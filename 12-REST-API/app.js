require("dotenv").config();
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const feedRoutes = require("./routes/feed");

const app = express();

// app.use(bodyParser.urlencoded()) // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use("/12-REST-API/images", express.static(path.join(__dirname, "images")));

// Set headers to prevent CORS Error
app.use((req, res, next) => {
  // 1st: header type, 2nd: which domain to allow
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Allow specific methods
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );

  // Allows client to set headers with Content-Type
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/feed", feedRoutes);

app.use((error, req, res, next) => {
  console.log(error); ///
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message: message });
});

// db connection
mongoose
  .connect(process.env.MONGODB_URI_MESSAGES, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(result => {
    const port = 8080;
    app.listen(port, () => {
      console.log(`Listening on port ${port}...`);
    });
  })
  .catch(err => {
    console.log(err);
  });
