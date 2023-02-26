const ObjectId = require('mongoose').Types.ObjectId;
const Concert = require("../models/concert");
const User = require("../models/user");
const ExpressError = require("../utilities/ExpressError");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});
const {noConcertExists} = require("../middleware");
const {cloudinary} = require("../cloudinary");
const Email = require("../utilities/Email");

module.exports = {
    async index(req,res) {
        let concerts,
            count,
            dbSearchQuery = {},
            searchQuery,
            numPerPage = (req.query.num >= 0) ? parseInt(req.query.num) || 10 : 10,
            currentPage = (Number.isInteger(parseInt(req.query.page)) && (parseInt(req.query.page)) > 0) ? parseInt(req.query.page) : 1,
            numOfPages,
            docsToSkip,
            sortOption = {},
            sortUrl = req.query.sort;

        //Possibly Replace these IFs with single statement
        if (req.query.search) {
            searchQuery = req.originalUrl;
            if (searchQuery.includes('page'))
                searchQuery = searchQuery.replace(/&page=[0-9]+/, '');
            if (searchQuery.includes('num'))
                searchQuery = searchQuery.replace(/&num=[0-9]+/, '');
            if (searchQuery.includes('sort'))
                searchQuery = searchQuery.replace(/&sort=.*$/, '');

            dbSearchQuery = {$or: [{title: new RegExp(`${req.query.search}`,`i`)},
                {location: new RegExp(`${req.query.search}`, 'i')}]};
        }

        switch(sortUrl) {
            case "titleA": 
                sortOption.title = 1;
                sortUrl = '&sort=titleA';
                break;
            case "titleZ":
                sortOption.title = -1;
                sortUrl = '&sort=titleZ';
                break;
            case "priceHigh":
                sortOption.price = -1;
                sortUrl = '&sort=priceHigh';
                break;
            case "priceLow":
                sortOption.price = 1;
                sortUrl = '&sort=priceLow';
                break;
            default:
                sortUrl = '&sort=none';
        }
       
        count = await Concert.find(dbSearchQuery).countDocuments();
        numOfPages = Math.ceil(count / numPerPage);
        docsToSkip = numPerPage * (currentPage - 1);
        concerts = await Concert.find(dbSearchQuery, '', {sort: sortOption, skip: docsToSkip, limit: numPerPage});
        res.render("concerts/index",{concerts, searchQuery, 
            textQuery: req.query.search, numPerPage, currentPage, numOfPages, sortUrl});
    },
    renderNew(req,res) {
        res.render("concerts/new");
    },
    async createNew(req,res){
        let concert = new Concert(req.body.concert);
        concert.author = req.user.id;

        if (req.file !== undefined) {
            concert.image = {url: req.file.path, filename: req.file.filename};
        }
        else {
            throw new ExpressError("Must upload an image", 400);
        }
        
        let geoData = await geocoder.forwardGeocode({
            query: concert.location,
            limit: 1
        }).send();
        concert.geometry = geoData.body.features[0].geometry;
        await concert.save();

        //Get Creator's Follower List's Usernames and Emails
        let user = await User.findOne({_id: {$eq: req.user.id}}, {'username':1, 'followers':1})
                .populate(
                    {path:'followers',select:'username email'});
        let followerList = user.followers;
        Email(followerList, concert, user.username).catch(console.error);

        req.flash('success', 'Concert Created!');
        res.redirect(`/concerts/${concert._id}`);
    },
    async renderConcert(req,res){
        try{
            //Retrieve concert data
            let concert = await Concert.findById(req.params.id)
            .populate({path: 'reviews', populate: {path: 'author'}})
            .populate({path:'attendees', select:'username image'})
            .populate(
                {path:'author', 
                populate:[
                    {path:'followers', model:'user', select: 'username image'},
                     'following']
                }
            );

            //Aggregation pipeline to retrieve number of reviews and average score
            let pipeline = [
                {
                  '$match': {
                    '_id': concert._id
                  }
                }, {
                  '$lookup': {
                    'from': 'reviews', 
                    'localField': 'reviews', 
                    'foreignField': '_id', 
                    'as': 'list'
                  }
                }, {
                  '$project': {
                    'count': {
                      '$size': '$list'
                    },
                    'avg': {
                      '$avg': '$list.rating'
                    }
                  }
                }
              ];

            let aggregation = await Concert.aggregate(pipeline);
            let numOfReviews = aggregation[0].count;
            let avgScore = (numOfReviews === 0) ? 0 : aggregation[0].avg.toFixed(1);

            //Query to retrieve related concerts based on concert title
            let dbSearchQuery = {$and: [
                {$or: [{title: new RegExp(`${concert.title}`,`i`)},
                    {title: new RegExp(`${concert.title.substring(0, concert.title.indexOf(' '))}`, 'i')},
                    {title: new RegExp(`${concert.title.substring(concert.title.indexOf(' ') + 1, concert.title.length - 1)}`, 'i')}]},
                {_id: {$not: {$eq: req.params.id}}}]};

            let related = await Concert.find(dbSearchQuery, 
                {'title':1,'author':1, 'location':1, 'image':1, 'price':1}, 
                {limit:5})
            .populate('author', 'username');
            
            res.render("concerts/details",{concert, related, numOfReviews, avgScore});
        }
        catch(err) {
            noConcertExists();
        }
    },
    async renderEditConcert(req,res){
        try {
            let concert = await Concert.findById(req.params.id);
            res.render(`concerts/edit`,{concert});
        }
        catch(err) {
            noConcertExists();
        }
    },
    async editConcert (req,res) {
        await Concert.findByIdAndUpdate(req.params.id,{...req.body.concert});
        req.flash('success', 'Concert Updated!');
        res.redirect(`/concerts`);
    },
    async renderEditConcertPhoto(req,res){
        try {
            let concert = await Concert.findById(req.params.id);
            res.render(`concerts/editPhoto`,{concert});
        }
        catch(err) {
            noConcertExists();
        }
    },
    async editConcertPhoto(req,res) {
        //Find current concert, delete existing image unless default image
        let concert = await Concert.findById(req.params.id);
        if (concert.image.filename && concert.image.filename != process.env.DEFAULT_CONCERT_IMG) {
            await cloudinary.uploader.destroy(concert.image.filename);
        } 

        let imageNew = {url: req.file.path, filename: req.file.filename};
        await Concert.findByIdAndUpdate(req.params.id,{$set: {image: imageNew}});
        req.flash('success', 'Photo Updated!');
        res.redirect(`/concerts/${req.params.id}`);
    },
    async deleteConcertPhoto(req,res) {
        let concert = await Concert.findById(req.params.id);
        if (concert.image.filename) {
            if (concert.image.filename != process.env.DEFAULT_CONCERT_IMG) {
                await cloudinary.uploader.destroy(concert.image.filename);
            }
            concert.image.filename = "";
            concert.image.url = "";
            await concert.save();
            req.flash('success', 'Image deleted');
        } else {
            req.flash('error', 'No image to delete');
        }
        res.redirect(`/concerts/${req.params.id}`);
    },
    async deleteConcert(req,res) {
        let concert = await Concert.findById(req.params.id);
        if (concert.image.filename && concert.image.filename != process.env.DEFAULT_CONCERT_IMG) {
            await cloudinary.uploader.destroy(concert.image.filename);
        }
        await Concert.findByIdAndDelete(req.params.id);
        req.flash('successDeleted', 'Concert Deleted!');
        res.redirect('/concerts');
    },
    async attendConcert(req, res) {
        let userID = req.body.myId;
        let concertID = req.params.id;
        const concertResult = await Concert.updateOne({_id:{$eq:concertID}}, {$addToSet:{attendees:ObjectId(userID)}});
        const userResult = await User.updateOne({_id:{$eq:userID}}, {$addToSet:{attending:ObjectId(concertID)}});

        const result = {concertResult,userResult};
        res.json(result);
    },
    async unattendConcert(req, res) {
        let userID = req.body.myId;
        let concertID = req.params.id;
        const concertResult = await Concert.updateOne({_id:{$eq:concertID}}, {$pull:{attendees:ObjectId(userID)}});
        const userResult = await User.updateOne({_id:{$eq:userID}}, {$pull:{attending:ObjectId(concertID)}});

        const result = {concertResult,userResult};
        res.json(result);
    }
}