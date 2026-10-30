const cloudinary = module.require('cloudinary');
const multerCloudinary = module.require('multer-storage-cloudinary');

if(process.env.NODE_ENV != 'production'){
    module.require('dotenv').config();
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports.storage = new multerCloudinary({
    cloudinary: cloudinary,
    params: {
        folder: 'airbnb',
        allowedFiles: ['jpg','png','jpeg','webp']
    }
})
