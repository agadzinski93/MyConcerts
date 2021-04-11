const mongoose = require("mongoose");
const cities = require("./cities");
const {places,descriptors} = require("./seedHelpers");
const Concert = require("../models/concert");
const Review = require("../models/review");

mongoose.connect("mongodb://localhost:27017/concert-finder",{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true
});

const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("Databse connected");
});

function sample(array) {
    return array[Math.floor(Math.random() * array.length)];
}

async function seedDB() {
    await Concert.deleteMany({});
    await Review.deleteMany({});
    for(let i = 0;i< 200; i++) {
        let random1000 = Math.floor(Math.random() * 1000);
        let price = Math.floor(Math.random() * 250) + 100;
        let c = new Concert({
            title:`${sample(descriptors)} ${sample(places)}`,
            location:`${cities[random1000].city}, ${cities[random1000].state}`,
            geometry: {
                type : "Point",
                coordinates : [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            //image:"https://picsum.photos/300/200",
            image: {
                url: "https://res.cloudinary.com/dlv7hwwa7/image/upload/v1616816120/MyConcerts/wduju3roeggb2tydde2h.webp",
                filename: "MyConcerts/wduju3roeggb2tydde2h"},
            description:"lorem ipsum dolor sit amet consectetur adipisicing elit. Cupiditate aliquam corporis reiciendis quos facilis! Voluptas expedita magnam culpa inventore obcaecati ratione accusamus omnis voluptatem doloribus! Ea ipsam ducimus amet neque.",
            author:"6072af4999da912db8404593", //ADMIN
            price
        });
        await c.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close();
});