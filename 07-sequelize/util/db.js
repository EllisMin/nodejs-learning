const Sequelize = require("sequelize");
// Connect mysql database with sequelie
const sequelize = new Sequelize("nodejs", "root", "00000000", {
  dialect: "mysql",
  host: "localhost"
});

module.exports = sequelize;