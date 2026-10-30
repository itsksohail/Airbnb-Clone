const mongoose = module.require('mongoose');
const {Schema} = mongoose;

let reviewSchema = mongoose.Schema({
    star_point: Number,
    feedback_comment: String,
    feedback_author: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
    ,
    feedback_date: {
        type: Date,
        default: Date.now()
    }
});

let reviewModel = mongoose.model('Review', reviewSchema);

module.exports = reviewModel;