const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const errorController = require("./controllers/error");
const mongoose = require("mongoose");
const session = require("express-session");
const User = require("./models/user");

const app = express();

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
    saveUninitialized: false
    // ,cookie: {}
  })
);

// executed for every incoming request
app.use((req, res, next) => {
  User.findById("5e0a965461c8b9f9c6908ced")
    .then(user => {
      // Adding a new field to req obj; to be used elsewhere
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

// Handle routes
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.getPageNotFound);

// db connection
mongoose
  .connect(
    "mongodb+srv://Ellis:00000000@cluster0-6s9e0.mongodb.net/shop?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    }
  )
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
