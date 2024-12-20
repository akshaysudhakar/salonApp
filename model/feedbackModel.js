const Sequelize = require('sequelize')
const sequelize = require('./../util/database');

const feedback_model = sequelize.define('feedback', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    review :{
        type : Sequelize.TEXT,
        allowNull : false,
    },
    reply :{
        type : Sequelize.TEXT,
        allowNull : true,
    }
})

module.exports = feedback_model;