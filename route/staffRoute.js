const express = require('express');
const route = express.Router();

const authenticate = require('../middlewares/auth');
const staffControle = require('./../controller/staffControle')


route.get('/getDetails', express.json(), express.urlencoded({ extended: true }), authenticate, staffControle.getDetails);

route.post('/postReview', express.json(), express.urlencoded({ extended: true }), authenticate, staffControle.postReview);

route.post('/postReply', express.json(), express.urlencoded({ extended: true }), authenticate, staffControle.postReply);




module.exports = route;