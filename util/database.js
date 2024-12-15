const Sequelize = require('sequelize');

require('dotenv').config()

const db_name  = process.env.DB_NAME 
const db_host  = process.env.DB_HOST 
const db_password  = process.env.DB_PASSWORD 
const db_username  = process.env.DB_USERNAME

const sequelize = new Sequelize(db_name, db_username, db_password, {
  dialect: 'mysql',
  host: db_host
});

module.exports = sequelize;