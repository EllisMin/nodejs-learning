require("dotenv").config();
const express = require("express");
const feedRoutes = require("./routes/feed");
const app = express();

app.use("/feed", feedRoutes);

const port = 8080;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
