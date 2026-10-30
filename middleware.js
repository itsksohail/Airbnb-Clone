const ErrorHandle = module.require('./utils/errorHandle.js');
const { joiListingSchema, joiReviewSchema } = module.require('./joiSchema/joiSchema.js');
const asyncWrap = module.require('./utils/asyncWrap.js');
const listingModel = module.require('./schemaModel/listingSchema.js');
const reviewModel = module.require('./schemaModel/reviewModel.js');

module.exports.joiReviewValidate = asyncWrap(async (req, res, next) => {
    let joiObj = await joiReviewSchema.validate(req.body);
    if (!joiObj.error) {
        next();
    } else {
        next(new ErrorHandle(400, joiObj.error));
    }
});

module.exports.joiListingValidate = asyncWrap(async (req, res, next) => {
    let joiObj = await joiListingSchema.validate(req.body);

    if (!joiObj.error) {
        next();
    } else {
        next(new ErrorHandle(500, joiObj.error));
    }
});

module.exports.joiUpdateSchemaValidation = asyncWrap(async (req, res, next) => {
    let { error } = joiListingSchema.validate(req.body, { abortEarly: false });
    if (error) {
        req.flash("flashError", "Listing Update Failed");
        console.log(req.flash("flashError"));
        res.json({ success: false });
    }
    next();
});

module.exports.isLoggedIn = (req, res, next) => {
    let auth = req.isAuthenticated();
    console.log("bool",auth);
    if(!auth){
        req.flash("flashError","You must have an account to access this feature, signup or login to access it.");
        if(req.get('Accept')?.includes('application/json')){
            let { originalUrl } = req.query;
            req.session.redirectUrl = originalUrl
            return res.status(401).json({
                success: false,
                message: "You must login first"
            });
        }else{
            let {originalUrl} = req.query;
            if(originalUrl){
                req.session.redirectUrl = originalUrl;
                res.redirect('/login');
            }else{
                req.session.redirectUrl = req.originalUrl;
                res.redirect(`/login`);
            }
        }
    }else{
        next();
    }
}

module.exports.reqToresRedirectUrl = (req, res, next) => {

    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }

    next();

}

module.exports.isOwner = async(req, res, next)=>{
    let { id } = req.params;
    let listingResp = await listingModel.findById(id);
    if(res.locals.currUser && listingResp.owner[0]._id.equals(res.locals.currUser._id)){
        next();
    }else{
        req.flash('flashError', "You are not the owner");
        return res.redirect(`/listings/${id}`);
    }
}

module.exports.isReviewOwner = async(req, res, next)=>{
    let { lis_id, rev_id } = req.params;
    let reviewResp = await reviewModel.findById(rev_id);
    if(reviewResp.feedback_author[0]._id.equals(req.user._id)){
        next();
    }else{
        req.flash('flashError','You are not the owner');
        res.redirect(`/listings/${lis_id}`);
    }
}