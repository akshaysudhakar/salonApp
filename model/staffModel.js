const Sequelize = require('sequelize')
const sequelize = require('./../util/database');

const staff_model = sequelize.define('staff', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name :{
        type : Sequelize.STRING,
        allowNull : false,
    }
})

module.exports = staff_model;