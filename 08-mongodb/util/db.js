const Sequelize = require("sequelize").Sequelize;
// Connect mysql database with sequelize
const sequelize = new Sequelize("nodejs", "root", "00000000", {
  dialect: "mysql",
  host: "localhost"
});

module.exports = sequelize;