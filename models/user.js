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
    image: {
        type:String,
        require:true,
    }
});

UserSchema.plugin(passLocalMongoose);

module.exports = mongoose.model('user', UserSchema);