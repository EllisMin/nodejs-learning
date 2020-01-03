const express = require("express");
const { check } = require("express-validator/check");
const router = express.Router();
const authController = require("../controllers/auth");

router.get("/login", authController.getLogin);

router.post("/login", authController.postLogin);

router.get("/signup", authController.getSignup);

// check() takes the input name field
router.post(
  "/signup",
  check("email")
    .isEmail()
    .withMessage("Please enter a valid email"),
  // chaining a custom validator
  // .custom((value, { req }) => {
  //   if (value === "test@test.com") {
  //     throw new Error("This email address is forbidden");
  //   }
  //   return true;
  // }),
  authController.postSignup
);

router.post("/logout", authController.postLogout);

router.get("/reset", authController.getReset);

router.post("/reset", authController.postReset);

router.get("/reset/:token", authController.getNewPassword);

router.post("/new-pwd", authController.postNewPassword);

module.exports = router;
