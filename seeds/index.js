const mongoose = require("mongoose");
const cities = require("./cities");
const {places,descriptors} = require("./seedHelpers");
const Concert = require("../models/concert");

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
    for(let i = 0;i< 30; i++) {
        let random1000 = Math.floor(Math.random() * 1000);
        let price = Math.floor(Math.random() * 250) + 100;
        let c = new Concert({
            title:`${sample(descriptors)} ${sample(places)}`,
            location:`${cities[random1000].city}, ${cities[random1000].state}`,
            image:"https://picsum.photos/300/200",
            description:"lorem ipsum dolor sit amet consectetur adipisicing elit. Cupiditate aliquam corporis reiciendis quos facilis! Voluptas expedita magnam culpa inventore obcaecati ratione accusamus omnis voluptatem doloribus! Ea ipsam ducimus amet neque.",
            price
        });
        await c.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close();
});