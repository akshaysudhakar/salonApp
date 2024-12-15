const express = require('express');
const route = express.Router();

const authenticate = require('../middlewares/auth');
const appointmentControle = require('./../controller/appointmentControle');

route.post('/bookAppointment', express.json(), express.urlencoded({ extended: true }), authenticate, appointmentControle.bookAppointment);

route.post('/confirmPayment', appointmentControle.paymentHandler);

module.exports = route;