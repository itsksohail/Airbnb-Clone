const mongoose = module.require('mongoose');
const passportLocalMongoose = module.require('passport-local-mongoose');
const Schema = mongoose.Schema;

let userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        require: true
    }
});

userSchema.plugin(passportLocalMongoose.default || passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);