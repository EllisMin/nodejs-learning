require("dotenv").config();
const path = require("path");
const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const graphqlHttp = require("express-graphql");

const graphqlSchema = require("./graphql/schema");
const graphqlResolver = require("./graphql/resolvers");
const auth = require("./middleware/auth");
const { clearImage } = require("./util/file");

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

// Stream to create a file
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  // a: new data gets appended instead of overwrite
  { flags: "a" }
);

app.use(helmet());
// May be provided by hosting provider
app.use(compression());
// Logs Requests
app.use(morgan("combined", { stream: accessLogStream }));

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

  // Handle options request since graphql only accepts get/post requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// Auth middleware that runs for every graphql request
app.use(auth);

// Middleware to handle uploading image
app.put("/post-image", (req, res, next) => {
  if (!req.isAuth) {
    throw new Error("Not authenticated");
  }
  if (!req.file) {
    return res.status(200).json({ message: "No file provided" });
  }
  // Delete old image
  if (req.body.oldPath) {
    clearImage(req.body.oldPath);
  }

  return res
    .status(201)
    .json({ message: "Filed stored", filePath: req.file.path });
});

// GraphQL middleware config
app.use(
  "/graphql",
  graphqlHttp({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    // Allows to use graph ql interface on browser ("../graphql")
    graphiql: true,
    // Formatting the custom error
    customFormatErrorFn(err) {
      if (!err.originalError) {
        // throw graphql default error
        return err;
      }
      const data = err.originalError.data;
      const message = err.message || "An error occurred";
      const code = err.originalError.code || 500;
      // return custom error
      return { message: message, status: code, data: data };
    }
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
