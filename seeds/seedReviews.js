/**
 * Deletes all existing reviews
 * Adds fake reviews to all concerts from currently existing user collection
 * Random number of reviews from 1 to total number of users, every other concert will have 0
 * Fake dummy text will be used
 */
require('dotenv').config();
const mongoose = require('mongoose');

const Concert = require("../models/concert");
const Review = require("../models/review");
const User = require("../models/user");

const mongoURI = (process.env.NODE_ENV === "development") ? 
    "mongodb://127.0.0.1:27017/concert-finder" : 
    process.env.MONGODB_URI;

mongoose.connect(mongoURI);
const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("Databse connected");
});

/**
 * returns object that contains array of User IDs
 */
async function getUsers() {
    const users = await User.find({}, {_id:1});
    return {users, numOfUsers:users.length}
}

async function seedReviews(){
    let output = null;
    try {
        const {users,numOfUsers} = await getUsers();
        output = await Review.deleteMany({});
        console.log('Deleted Reviews');
        console.log(output);
        output = await Concert.updateMany({},{$set:{'reviews':[]}});
        console.log('Emptying Review Arrays in Concerts');
        console.log(output);
        const concerts = await Concert.find({},{reviews:1});
        let review;
        for (let i = 0; i < concerts.length; i++) {
            if ((i+1) % 3 !== 0) {
                let numOfReviews = Math.floor(Math.random() * numOfUsers) + 1;
                for (let j = 0; j < numOfReviews; j++) {
                    let rating = Math.floor(Math.random() * 5) + 1;
                    review = new Review({
                        rating,
                        author:users[j]._id,
                        body:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse finibus neque at justo luctus efficitur. Praesent luctus ante at diam sagittis dapibus. Phasellus dictum commodo libero, id ultricies purus. Donec et turpis at ex scelerisque finibus vitae nec lectus."
                    });
                    await review.save();
                    concerts[i].reviews.push(review);
                    await concerts[i].save();
                }
            }
        }
        console.log('Seeding Reviews Completed!');
    } catch (err) {
        console.error(`Error Seeding Reviews: ${err.stack}`);
    }
}

seedReviews().then(()=>{
    mongoose.connection.close();
});