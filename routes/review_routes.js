const express = module.require('express');
const route = express.Router({ mergeParams: true });
const asyncWrap = module.require('../utils/asyncWrap.js');
const { isLoggedIn, isReviewOwner, joiReviewValidate } = module.require('../middleware.js');
const { reviewPost, reviewDelete } = module.require('../controllers/review_controller.js');

route.post('/', isLoggedIn, joiReviewValidate, asyncWrap(reviewPost));

route.delete('/:rev_id', isLoggedIn, isReviewOwner, asyncWrap(reviewDelete));

module.exports = route;