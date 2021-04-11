const mongoose = require("mongoose");
const review = require("./review");
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String, 
    filename: String
});

ImageSchema.virtual('thumbnail').get(function()  {
    return this.url.replace('/upload', '/upload/w_200');
});

const ConcertSchema = new Schema({
    title:String,
    price:Number,
    description:String,
    location:String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    image: ImageSchema,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    reviews: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref:'review'
    }]
},{
    toJSON: {virtuals:true}
});

ConcertSchema.index({location: 'text'});

ConcertSchema.virtual('properties.popupMarkup').get(function() {
    return `<a href="/concerts/${this._id}">${this.title}</a>`;
});

ConcertSchema.post('findOneAndDelete', async(doc) => {
    if (doc) {
        await review.deleteMany({_id: {$in: doc.reviews}});
    }
});

module.exports = mongoose.model("Concert",ConcertSchema);