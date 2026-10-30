const express = module.require('express');
const mongoose = module.require('mongoose');
const dns = module.require('node:dns');
const path = module.require('path');
const method_override = module.require('method-override');
const ejs_mate = module.require('ejs-mate');
const ErrorHandle = module.require('./utils/errorHandle.js');
const listingModel = module.require('./schemaModel/listingSchema.js');
const reviewModel = module.require('./schemaModel/reviewModel.js');
const listing_routes = module.require('./routes/listing_routes.js');
const review_routes = module.require('./routes/review_routes.js');
const expSession = module.require('express-session');
const { MongoStore } = module.require('connect-mongo');
const flash = module.require('connect-flash');
const user_routes = module.require('./routes/user_routes.js');
const passport = module.require('passport');
const passport_local = module.require('passport-local');
const userModel = module.require('./schemaModel/userSchema.js');
const {isLoggedIn, reqToresRedirectUrl} = module.require('./middleware.js');
const app = express();

dns.setServers(['1.1.1.1', '8.8.8.8']);

const port = 3000;

const dbUrl = process.env.MONGODB_ATLAS_API;


app.listen(port, () => {
    console.log(`Server listening to port : ${port}`);
});

main()
    .then((resp) => {
        console.log('Mongodb Connection Successful');
    })
    .catch((err) => {
        console.log('Mongodb Connection Failed', err);
    });

async function main() {
    await mongoose.connect(dbUrl);
    // 'mongodb://localhost/wanderlust'
}

app.engine('ejs', ejs_mate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(method_override('_method'));
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static(path.join(__dirname, '/uploads')));

let store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET_MONGO_SESSION
    },
    touchAfter: 24 * 3600
})

store.on('error', ()=>{
    console.log('mongo session store error: ', err);
})

const expSessionOpt = {
    store,
    secret: process.env.SECRET_EXP_SESSION,
    resave: false,
    saveUninitialized: true,
    cookies: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 60 * 60 * 1000,
        httpOnly: true
    }
}

app.use(expSession(expSessionOpt));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new passport_local(userModel.authenticate()));
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser()); 

app.use((req, res, next)=>{
    res.locals.flashSuccess = req.flash("flashSuccess");
    res.locals.flashError = req.flash("flashError");
    res.locals.passportError = req.flash("error");
    res.locals.currUser = req.user;
    next();
});


app.use('/', listing_routes);

app.use('/listings/:lis_id/reviews', review_routes);

app.use('/', user_routes);

app.get('/', (req, res) => {
    res.redirect('/home');
});

app.get('/create_new_listing', isLoggedIn, (req, res, next) => {
    res.render('listingForm.ejs');
});

app.all('/{*splat}', (req, res, next) => {
    next(new ErrorHandle(400, "Bad request"));
});

app.use((err, req, res, next) => {
    if (err.name === "ValidationError") {
        next(new ErrorHandle(400, err.message));
    } else if(err.name === "UserExistsError"){
        next(new ErrorHandle(400, err.message));
    } 
    else {
        next(err);
    }
});

app.use((err, req, res, next) => {
    let { statuscode = 500, default_message = "Backend Internal error" } = err;
    res.status(statuscode).render('error.ejs', { err });
});
