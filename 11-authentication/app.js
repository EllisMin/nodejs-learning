const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const errorController = require("./controllers/error");
const mongoose = require("mongoose");
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");
require("dotenv").config();
const helmet = require("helmet");

// import session, session storage
const session = require("express-session");
const MongoDbStore = require("connect-mongodb-session")(session);

const User = require("./models/user");
const MONGODB_URI =
  "mongodb+srv://Ellis:00000000@cluster0-6s9e0.mongodb.net/shop";

const app = express();
app.use(helmet());
const store = new MongoDbStore({
  uri: MONGODB_URI,
  collection: "sessions"
  //, expires:
});

const csrfProtection = csrf();
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 1st: error, 2nd: destination
    cb(null, "11-authentication/images");
  },
  filename: (req, file, cb) => {
    // replace to remove : in file name
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
    );
  }
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    // 2nd: whether to store file
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// Set up ejs
app.set("view engine", "ejs");
app.set("views", "11-authentication/views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
// extract file data when there's a request with multer
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single("img"));

app.use(express.static(path.join(__dirname, "public")));
app.use(
  "/11-authentication/images",
  express.static(path.join(__dirname, "images"))
);

// config session
app.use(
  session({
    // should be a long str value in production
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store
    //, cookie: {}
  })
);

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
  // isAuthenticated: req.session.isLoggedIn,
  // csrfToken: req.csrfToken()
});

app.use((req, res, next) => {
  // throw new Error("Dummy err(Synchronous)");///
  if (!req.session.user) {
    return next();
  }
  // create user from session
  User.findById(req.session.user._id)
    .then(user => {
      // throw new Error("Dummy err(Async)");///
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch(err => {
      // Use next(new Error()) for async error handling
      next(new Error(err));
    });
});

// Handle routes
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.get("/500", errorController.get500);
app.use(errorController.getPageNotFound);
// error handling middleware
app.use((err, req, res, next) => {
  // res.redirect("/500");
  // Other way of handling
  // res.status(error.httpStatusCode).render(...);
  console.log(err); ///
  res.status(500).render("500", {
    pageTitle: "Server Error",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn
  });
});

// db connection
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(result => {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Listening on port ${port}...`);
    });
  })
  .catch(err => {
    console.log(err);
  });
