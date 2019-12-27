const express = require("express");
const path = require("path");

const router = express.Router();

// Routing. "/" is default
// get() does exact match while use() does "includes"
router.get("/", (req, res, next) => {
  // Send the response; default content type is html; no need for setHeader()
  res.sendFile(path.join(__dirname, "..", "views", "shop.html"));
});

module.exports = router;
