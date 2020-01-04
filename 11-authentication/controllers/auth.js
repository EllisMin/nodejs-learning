const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const sgMail = require("@sendgrid/mail");
const { validationResult } = require("express-validator/check");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    // pulling error message
    errorMessage: message
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      // pulling error message
      errorMessage: errors.array()[0].msg
    });
  }

  // create user session
  User.findOne({ email: email })
    .then(user => {
      // email doesn't exist
      if (!user) {
        req.flash("error", "email doesn't exist");
        return res.redirect("/login");
      }
      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            console.log("Login successful");
            return req.session.save(err => {
              if (err) console.log(err);
              res.redirect("/");
            });
          }
          req.flash("error", "incorrect password");
          res.redirect("/login");
        })
        .catch(err => {
          console.log(err);
          res.redirect("/login");
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
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: message
  });
};
exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // console.log(errors.array()); ///
    // validation failed
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      errorMessage: errors.array()[0].msg
    });
  }

  // encrypt with 12 rounds of hashing
  bcrypt
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
      console.log("User created"); ///
      res.redirect("/login");
      // sending email
      const msg = {
        to: email,
        from: "shop@ellismin.com",
        subject: "Signup succeeded!",
        html: "<h1>You successfully signed up!</h1>"
      };
      return sgMail.send(msg);
    })
    .then(result => {
      console.log("Email(signup) sent to " + email); ///
    })
    .catch(err => {
      console.log(err);
    });
};

// Find password
exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset-pwd", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: message
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    const email = req.body.email;
    User.findOne({ email: email })
      .then(user => {
        if (!user) {
          req.flash("error", "No user found with the email");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000; // valid for 1 hr
        return user
          .save()
          .then(result => {
            res.redirect("/login");
            // sending email
            const msg = {
              to: email,
              from: "shop@ellismin.com",
              subject: "Password reset",
              html: `<p>You've requested a password reset</p>
              <p>Click this <a href="http://localhost:3000/reset/${token}">link</a>
              to set a new password.</p>`
            };
            return sgMail.send(msg);
          })
          .then(res => {
            console.log("Email(pwd reset) sent to " + email); ///
          })
          .catch(err => {
            console.log(err);
          });
      })
      .catch(err => {
        console.log(err);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() }
  })
    .then(user => {
      if (!user) {
        console.log("Token doesn't exist"); ///
        res.redirect("/");
      } else {
        let message = req.flash("error");
        if (message.length > 0) {
          message = message[0];
        } else {
          message = null;
        }
        res.render("auth/new-pwd", {
          path: "/new-pwd",
          pageTitle: "New Password",
          errorMessage: message,
          userId: user._id.toString(),
          passwordToken: token
        });
      }
    })
    .catch(err => {
      console.log(err);
    });
};

// set up new pwd
exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;
  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId
  })
    .then(user => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(result => {
      console.log("Password reset complete");
      res.redirect("/login");
      // sending email
      const msg = {
        to: resetUser.email,
        from: "shop@ellismin.com",
        subject: "Password reset complete",
        html: `<h1>You've set a new password</h1>`
      };
      return sgMail.send(msg);
    })
    .catch(err => {
      console.log(err);
    });
};
