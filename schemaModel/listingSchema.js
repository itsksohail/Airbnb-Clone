const mongoose = module .require('mongoose');
const {Schema} = mongoose;
const reviewModel = module.require('./reviewModel.js');

let listingSchema = mongoose.Schema({
    title: {
        type: String
    },
    description: {
        type: String
    },
    image: {
        originalname: String,
        secure_url: {
            type: String,
            default: "https://thumbs.dreamstime.com/b/imagen-no-es-un-icono-disponible-vectorial-en-fondo-blanco-eps-330821927.jpg?w=768",
            set: (v) =>
                v === ""
                ? "https://thumbs.dreamstime.com/b/imagen-no-es-un-icono-disponible-vectorial-en-fondo-blanco-eps-330821927.jpg?w=768"
                : v
            } 
    },
    price: {
        type: Number,
        required: true
    },
    location: {
        type: String
    },
    country: {
        type: String
    },
    feedbacks: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    owner: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    geocode: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    category: {
        type: String,
        enum: ['Trending', 'Rooms', 'Iconic Cities', 'Mountains', 'Castles', 'Amazing Pools', 'Camping', 'Farms', 'Arctic'],
        required: true
    }
});

listingSchema.post('findOneAndDelete', async(listing)=>{
    if(listing.feedbacks.length){
        await reviewModel.deleteMany({_id: {$in: listing.feedbacks}})
            .then((resp)=>{
                console.log('document deleted from review model', resp);
            });
    }
});

let listingModel = mongoose.model('Listing', listingSchema);

module.exports = listingModel;
