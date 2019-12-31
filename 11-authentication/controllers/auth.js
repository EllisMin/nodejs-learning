const bcrypt = require("bcryptjs");
const User = require("../models/user");

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: false
  });
};

exports.postLogin = (req, res, next) => {
  // create user session
  User.findById("5e0a965461c8b9f9c6908ced")
    .then(user => {
      req.session.isLoggedIn = true;
      req.session.user = user;
      // makes sure that session is created before continuing
      req.session.save(err => {
        // console.log(err);
        res.redirect("/");
      });
    })
    .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
  // clear session
  req.session.destroy(err => {
    res.redirect("/");
    if (err) console.log(err);
  });
};

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    isAuthenticated: false
  });
};
exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  User.findOne({
    email: email
  })
    .then(userDoc => {
      // duplicate email exists
      if (userDoc) {
        return res.redirect("/signup");
      }
      // encrypt with 12 rounds of hashing
      return bcrypt
        .hash(password, 12)
        .then(hashedPassword => {
          const user = new User({
            email: email,
            password: hashedPassword,
            cart: { items: [] }
          });
          return user.save();
        })
        .then(result => {
          console.log("User created");
          res.redirect("/login");
        });
    })
    .catch(err => {
      console.log(err);
    });
};
