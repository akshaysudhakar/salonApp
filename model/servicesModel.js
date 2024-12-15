const Sequelize = require('sequelize')
const sequelize = require('./../util/database');

const services_model = sequelize.define('services', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name :{
        type : Sequelize.STRING,
        allowNull : false,
    },
    price :{
        type : Sequelize.DECIMAL(10,2),
        allowNull : false,
    },
    duration : {
        type : Sequelize.INTEGER,
        allowNull : false,
    }
})

module.exports = services_model;