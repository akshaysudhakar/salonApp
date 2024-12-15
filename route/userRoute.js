const express = require('express');

const userControle = require('../controller/userControle')
const authenticate = require('../middlewares/auth');

const route = express.Router()


route.post('/signup', express.json(), express.urlencoded({ extended: true }), userControle.signUp);

route.post('/login', express.json(), express.urlencoded({ extended: true }), userControle.login);

route.get('/getDetails', express.json(), express.urlencoded({ extended: true }), authenticate, userControle.getDetails);

route.post('/getStylists',express.json(), express.urlencoded({ extended: true }), authenticate, userControle.getStylist);

route.post('/getStylistsSlots',express.json(), express.urlencoded({ extended: true }), authenticate, userControle.getbookedSlots);




module.exports = route;