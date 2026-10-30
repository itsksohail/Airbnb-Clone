const listingModel = module.require('../schemaModel/listingSchema.js');
let { fakeAirbnbListings } = module.require('../initListData.js');
const ErrorHandle = module.require('../utils/errorHandle.js');
const geoCodeService = module.require('@mapbox/mapbox-sdk/services/geocoding');
const geoCodeService_Client = geoCodeService({accessToken: process.env.MAPBOX_API_TOKEN});

let temp_default_img;

module.exports.homeRender = async (req, res) => {
    await listingModel.find({})
        .then((resp) => {
            res.render('homepage.ejs', { resp });
        })
}

module.exports.listingCount = async (req, res, next) => {
    try {
        await listingModel.countDocuments()
            .then((count) => {
                if (count == 0) {
                    fakeAirbnbListings = fakeAirbnbListings.map((obj) => ({ ...obj, owner: '6abf655611f53ce19b3cecb8' }));
                    listingModel.insertMany(fakeAirbnbListings)
                        .then((resp) => {
                            res.redirect('/home');
                        })
                        .catch((err) => {
                            next(new ErrorHandle(500, err));
                        })
                }
            })
    } catch (err) {
        console.log(err);
    }
}

module.exports.listingChipFilter = async(req, res, next)=>{
    let {cate} = req.params;
    await listingModel.find({category: cate})
        .then((resp)=>{
            res.render('homepage.ejs', {resp});
        });
}

module.exports.listingSearchFilter = async(req, res, next)=>{
    console.log('search query invoked');
    let { q } = req.query;
    console.log('search text ', q);
    await listingModel.find({title: {$regex: q, $options: 'i'}})
        .then((resp)=>{
            res.render('homepage.ejs', {resp});
        })
}

module.exports.createListing = async (req, res, next) => {
    let { title_name, desc_name, price_name, location_name, category_name, country_name } = req.body;

    console.log(title_name, desc_name, price_name, location_name, country_name);
    console.log('req.file type', typeof req.file);

    let geoResp = await geoCodeService_Client.forwardGeocode({
        query: `${location_name},${country_name}`,
        limit: 1
    }).send();

    
    const listingData = {
        title: title_name.trim(),
        description: desc_name.trim(),
        price: price_name,
        location: location_name.trim(),
        country: country_name,
        owner: req.user._id,
        category: category_name
    };
    
    if (typeof req.file !== 'undefined') {
        listingData.image = {
            originalname: req.file.originalname,
            secure_url: req.file.secure_url
        };
    } else {
        listingData.image = { originalname: "", secure_url: "" };
    }
    
    console.log(geoResp.body.features[0].geometry);

    if(geoResp.body.features[0].geometry){
        listingData.geocode = {
            type: geoResp.body.features[0].geometry.type,
            coordinates: geoResp.body.features[0].geometry.coordinates
        }
    }

    let lis1 = new listingModel(listingData);

    await lis1.save()
        .then((resp) => {
            req.flash("flashSuccess", "New listing added successfully");
            console.log(req.session);
            res.json({ success: true });
        });
}

module.exports.listingPreview = async (req, res, next) => {
    try {
        let { id } = req.params;
        console.log('listings preview id', id);
        let preResp = await listingModel.findById(id).populate({ path: 'feedbacks', populate: { path: 'feedback_author' } }).populate('owner');
        let prevImgOptimized = preResp.image.secure_url;
        prevImgOptimized = prevImgOptimized.replace('/upload','/upload/q_auto/f_auto/');
        console.log(preResp);
        if (preResp) {
            res.render('preview.ejs', { data: preResp, optImg: prevImgOptimized });
        } else if (!preResp) {
            req.flash("flashError", "Requested listing not available in the database");
            res.redirect('/home');
        }
    } catch (err) {
        console.log(err);
    }
}

module.exports.listingEdit = async (req, res) => {
    let { id } = req.params;
    let editPage = await listingModel.findById(id);

    let editPageImageOptimize = editPage.image.secure_url;
    editPageImageOptimize = editPageImageOptimize.replace('/upload','/upload/q_auto/f_auto/');

    if (editPage) {
        res.render('listEdit.ejs', { resp: editPage, optImg: editPageImageOptimize });
    } else if (!editPage) {
        req.flash("flashError", "Requested error page not available");
        res.redirect('/home');
    }
}

module.exports.listingUpdate = async (req, res, next) => {
    let { id } = req.params;
    let { title_name, description_name, price_name, location_name, country_name } = req.body;

    let editPage = await listingModel.findById(id);
    temp_default_img = { originalname: editPage.image.originalname, secure_url: editPage.image.secure_url };

    const listingUpdate = ({
        title: title_name.trim(),
        description: description_name.trim(),
        price: price_name,
        location: location_name.trim(),
        country: country_name
    });

    if (typeof req.file !== 'undefined') {
        listingUpdate.image = {
            originalname: req.file.originalname,
            secure_url: req.file.secure_url
        }
    } else {
        listingUpdate.image = { originalname: temp_default_img.originalname, secure_url: temp_default_img.secure_url };
    }

    await listingModel.findByIdAndUpdate(id, listingUpdate, { runValidators: true })
        .then((resp) => {
            req.flash("flashSuccess", "Listing updated successfully");
            res.json({ success: true });
        });
}

module.exports.listingDelete = async (req, res, next) => {
    let { id } = req.params;
    await listingModel.findByIdAndDelete(id)
        .then((resp) => {
            req.flash("flashSuccess", "Listing Deleted Successfully");
            res.json({ success: true });
        })
        .catch((err) => {
            req.flash("flashError", "Listing deletion failed");
            res.status(500).json({ success: false, error: err });
        });
}