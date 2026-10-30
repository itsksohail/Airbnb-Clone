const express = module.require('express');
const route = express.Router();
const asyncWrap = module.require('../utils/asyncWrap.js');
const passport = module.require('passport');
const { reqToresRedirectUrl } = module.require('../middleware.js');
const { signupPage, loginPage, passportLogout, passportSignup, passportLogin } = module.require('../controllers/user_controller.js');

route.get('/signup', signupPage);

route.get('/login', loginPage);

route.get('/logout', passportLogout);

route.post('/user/signup', asyncWrap(passportSignup));

route.post('/user/login', reqToresRedirectUrl, passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), asyncWrap(passportLogin));

module.exports = route;