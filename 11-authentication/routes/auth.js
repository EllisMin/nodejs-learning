const express = require("express");
const { check, body } = require("express-validator");
const router = express.Router();
const authController = require("../controllers/auth");
const User = require("../models/user");

router.get("/login", authController.getLogin);

router.post(
  "/login",
  [
    body("email", "Please enter a valid email")
      .normalizeEmail()
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then(userDoc => {
          if (!userDoc) {
            return Promise.reject("email doesn't exist");
          }
        });
      }),
    body("password", "Please enter a valid password")
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim()
  ],
  authController.postLogin
);

router.get("/signup", authController.getSignup);

// check() takes the input name field
router.post(
  "/signup",
  // Validation checks
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .trim()
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then(userDoc => {
          // duplicate email exists
          if (userDoc) {
            return Promise.reject("email already exists");
          }
        });
      })
      .normalizeEmail(),

    // Checking password in the body of the request
    body(
      "password",
      "Please enter a password with only numbers and alphabet & at least 5 characters."
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    })
  ],

  authController.postSignup
);

router.post("/logout", authController.postLogout);

router.get("/reset", authController.getReset);

router.post("/reset", authController.postReset);

router.get("/reset/:token", authController.getNewPassword);

router.post("/new-pwd", authController.postNewPassword);

module.exports = router;
