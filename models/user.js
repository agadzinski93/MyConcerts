const mongoose = require("mongoose");
const passLocalMongoose = require("passport-local-mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: {
        type:String,
        require: true,
        unique:true
    },
    followers: {
        type:Array,
        refPath: 'user',
    },
    following: {
        type:Array,
        refPath: 'user',
    },
    attending: {
        type:Array,
        refPath:'concert',
    },
    image: {
        type:String,
        require:true,
        default:'https://res.cloudinary.com/dlv7hwwa7/image/upload/v1650238267/MyConcerts/profile-pic_pgu8zl.jpg',
    }
});

UserSchema.plugin(passLocalMongoose);

module.exports = mongoose.model('user', UserSchema);