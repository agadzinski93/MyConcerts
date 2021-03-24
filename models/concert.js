const mongoose = require("mongoose");
const review = require("./review");
const Schema = mongoose.Schema;

const ConcertSchema = new Schema({
    title:String,
    image:{
        url: String, 
        filename: String
    },
    price:Number,
    description:String,
    location:String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    reviews: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref:'review'
    }]
});

ConcertSchema.post('findOneAndDelete', async(doc) => {
    if (doc) {
        await review.deleteMany({_id: {$in: doc.reviews}});
    }
});

module.exports = mongoose.model("Concert",ConcertSchema);