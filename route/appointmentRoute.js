const express = require('express');
const route = express.Router();
const bodyParser = require('body-parser');

const authenticate = require('../middlewares/auth');
const appointmentControle = require('./../controller/appointmentControle');

route.post('/bookAppointment', express.json(), express.urlencoded({ extended: true }), authenticate, appointmentControle.bookAppointment);

route.get('/cancel', express.json(), express.urlencoded({ extended: true }), authenticate, appointmentControle.cancel);

route.post('/confirmPayment',bodyParser.raw({ type: 'application/json' }),appointmentControle.paymentHandler);

module.exports = route;