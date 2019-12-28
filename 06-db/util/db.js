const mysql = require("mysql2");

// create pool of connects; allows to run multiple queries simultaneously
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  database: "nodejs",
  password: '00000000'
});

// Use promise to create connection asynchronously
module.exports = pool.promise();