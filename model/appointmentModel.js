const Sequelize = require('sequelize')
const sequelize = require('./../util/database');

  const appointment_model = sequelize.define('appointment', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      appointment_date: {
        type: Sequelize.DATEONLY, // Only stores the date (YYYY-MM-DD)
        allowNull: false,
      },
      start_time: {
        type: Sequelize.TIME, // Only stores time (HH:MM:SS)
        allowNull: false,
      },
      end_time: {
        type: Sequelize.TIME, // Only stores time (HH:MM:SS)
        allowNull: false,
      },
      payment : {
        type : Sequelize.BOOLEAN,
        default : false
      },
      sessionId : {
        type : Sequelize.STRING,
        allowNull : false
      }
})

module.exports = appointment_model;