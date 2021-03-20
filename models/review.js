const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    body: {
        type:String
    },
    rating: {
        type:Number,
        min:0,
        max:5
    }
});

module.exports = mongoose.model('review', reviewSchema);