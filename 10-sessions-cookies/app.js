const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const errorController = require("./controllers/error");
const mongoose = require("mongoose");

// import session, session storage
const session = require("express-session");
const MongoDbStore = require("connect-mongodb-session")(session);

const User = require("./models/user");
const MONGODB_URI =
  "mongodb+srv://Ellis:00000000@cluster0-6s9e0.mongodb.net/shop";

const app = express();
const store = new MongoDbStore({
  uri: MONGODB_URI,
  collection: "sessions"
  //, expires:
});

// Set up ejs
app.set("view engine", "ejs");
app.set("views", "10-sessions-cookies/views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// config session
app.use(
  session({
    // should be a long str value
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store
    //, cookie: {}
  })
);

// Handle routes
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.getPageNotFound);

// db connection
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(result => {
    User.findOne().then(user => {
      if (!user) {
        // create user
        const user = new User({
          name: "Ellis",
          email: "dummy@test.com",
          cart: {
            items: []
          }
        });
        user.save();
      }
    });

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Listening on port ${port}...`);
    });
  })
  .catch(err => {
    console.log(err);
  });
