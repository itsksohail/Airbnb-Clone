const userModel = module.require('../schemaModel/userSchema.js');

module.exports.signupPage = (req, res) => {
    res.render('signup.ejs');
}

module.exports.loginPage = (req, res) => {
    res.render('login.ejs');
}

module.exports.passportLogin = async (req, res) => {
    let { username} = req.body;
    req.flash("flashSuccess", `Hello ${username} Welcome to Wanderlust!`);
    let redirectUrl = res.locals.redirectUrl || '/home';
    res.redirect(redirectUrl);
}

module.exports.passportLogout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            req.flash('flashError', 'Logout failed');
            next(err)
        }

        req.session.destroy((sessionError)=>{
            if(sessionError){
                req.flash('flashError', sessionError);
                return next(sessionError);
            }
            res.clearCookie('connect.sid');
            res.redirect('/home');
        })
    });
}

module.exports.passportSignup = async (req, res, next) => {
    let { user_name, email_name, password_name } = req.body;
    console.log(user_name, email_name, password_name);
    let registerSignup = new userModel({
        email: email_name,
        username: user_name
    });
    let registerResponse = await userModel.register(registerSignup, password_name);
    console.log(registerResponse);
    req.login(registerResponse, (err) => {
        if (err) {
            next(err);
        }
        req.flash("flashSuccess", `Welcome ${user_name}, your account created successfully`);
        res.redirect('/home');
    });
}

