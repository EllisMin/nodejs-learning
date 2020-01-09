require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");

const feedRoutes = require("./routes/feed");

const app = express();

// app.use(bodyParser.urlencoded()) // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json

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
  res.setHeader("Access-Control-Allow-Headers",
   "Content-Type, Authorization");
  next();
});

app.use("/feed", feedRoutes);

const port = 8080;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
