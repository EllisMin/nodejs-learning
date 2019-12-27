// Server with express
const express = require("express");
const bodyParser = require("body-parser");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const path = require("path");

const app = express();

// Prevents requesting favicon; prevents having logging twice
// app.get('/favicon.ico', (req, res) => res.status(204));

// parse the request body
app.use(bodyParser.urlencoded({ extended: false }));
// Grant access to public path; allows to link css file in public
app.use(express.static(path.join(__dirname, "public")));

// Handle middlewares

// app.use((req, res, next) => {
//   // executed for every incoming request
//   console.log("In middleware"); ///
//   next(); // used to move on to next middleware
// });

// adminRoutes comes FIRST since home page also includes "/" & it won't handle the next request(home) without next()
app.use("/admin", adminRoutes); // adds '/admin' filter in url
app.use(shopRoutes);

// handle 404
app.use((req, res, next) => {
  res
    .status(404)
    .sendFile(path.join(__dirname, "views", "page-not-found.html"));
});

app.listen(3000);
