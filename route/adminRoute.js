const express = require('express');
const route = express.Router();

const authenticate = require('../middlewares/auth');
const adminControle = require('./../controller/adminControle')

route.post('/addservice', express.json(), express.urlencoded({ extended: true }), authenticate, adminControle.addService);

route.post('/addstaff', express.json(), express.urlencoded({ extended: true }), authenticate, adminControle.addStaff);

route.get('/getDetails', express.json(), express.urlencoded({ extended: true }), authenticate, adminControle.getDetails);




module.exports = route;