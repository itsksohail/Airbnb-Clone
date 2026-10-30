const joi = module.require('joi');

module.exports.joiListingSchema = joi.object({
    title_name: joi.string().required(),
    price_name: joi.number().required().min(0),
    location_name: joi.string().required(),
    country_name: joi.string().required(),
    desc_name: joi.string().required().max(1000)
});

module.exports.joiReviewSchema = joi.object({
    s_radio_name: joi.number().required().min(1).max(5),
    feedback_comment_name: joi.string().required().max(1000)
})