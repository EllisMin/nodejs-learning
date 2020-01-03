const express = require("express");
const { check, body } = require("express-validator/check");
const router = express.Router();
const authController = require("../controllers/auth");
const User = require("../models/user");

router.get("/login", authController.getLogin);

router.post("/login", authController.postLogin);

router.get("/signup", authController.getSignup);

// check() takes the input name field
router.post(
  "/signup",
  // Validation checks
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then(userDoc => {
          // duplicate email exists
          if (userDoc) {
            return Promise.reject("email already exists");
          }
        });
      }),

    // Checking password in the body of the request
    body(
      "password",
      "Please enter a password with only numbers and alphabet & at least 5 characters."
    )
      .isLength({ min: 5 })
      .isAlphanumeric(),
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
