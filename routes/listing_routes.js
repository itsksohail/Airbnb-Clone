const express = module.require('express');
const route = express.Router();
const asyncWrap = module.require('../utils/asyncWrap.js');
const multer = module.require('multer');
const { storage } = module.require('../cloudinaryConfig.js');
const { joiListingValidate, joiUpdateSchemaValidation, isLoggedIn, isOwner } = module.require('../middleware.js');
const { homeRender, listingCount, listingChipFilter, listingSearchFilter, createListing, listingPreview, listingEdit, listingUpdate, listingDelete } = module.require('../controllers/listing_controller.js');

// let storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, "uploads/");
//     },

//     filename: function (req, file, cb) {
//         const uniqueName = Date.now() + "_" + Math.round(Math.random() * 1e9) + "_";
//         cb(null, uniqueName + file.originalname);
//     }
// });

// let acceptedFile = (req, file, cb) => {
//     let requiredFile = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
//     if (requiredFile.includes(file.mimetype)) {
//         cb(null, true)
//     } else {
//         cb(new Error('File type not matched'), false)
//     }
// }

let upload = multer({ storage });

route.get('/autoInitListing', isLoggedIn, asyncWrap(listingCount));

route.get('/home', asyncWrap(homeRender));

route.get('/listings/:id', asyncWrap(listingPreview));

route.get('/listings/filter/:cate', asyncWrap(listingChipFilter));

route.get('/listings/find/search', asyncWrap(listingSearchFilter));

route.post('/listings/submit_list',isLoggedIn, joiListingValidate, upload.single('img_name'), asyncWrap(createListing));

route.get('/listings/:id/edit', isLoggedIn, isOwner, asyncWrap(listingEdit));

route.put('/listings/:id/update', isLoggedIn, isOwner, joiUpdateSchemaValidation, upload.single('image_name'), asyncWrap(listingUpdate));

route.delete('/listings/:id/delete', isLoggedIn, isOwner, asyncWrap(listingDelete));

module.exports = route;