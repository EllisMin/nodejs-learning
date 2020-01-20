require("dotenv").config();
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const graphqlHttp = require("express-graphql");

const graphqlSchema = require("./graphql/schema");
const graphResolver = require("./graphql/resolvers");

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "13-GraphQL/images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// app.use(bodyParser.urlencoded()) // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

app.use("/13-GraphQL/images", express.static(path.join(__dirname, "images")));

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

// GraphQL middleware
app.use(
  "/graphql",
  graphqlHttp({
    schema: graphqlSchema,
    rootValue: graphResolver,
    // Allows to use graph ql interface on browser ("../graphql")
    graphiql: true
  })
);

// Error handling middleware
app.use((error, req, res, next) => {
  console.log(error); ///
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data; // Passing original error data
  res.status(status).json({ message: message, data: data });
});

// db connection
mongoose
  .connect(process.env.MONGODB_URI_MESSAGES_GRAPHQL, {
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
