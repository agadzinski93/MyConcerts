const Concert = require("../models/concert");
const ExpressError = require("../utilities/ExpressError");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});
const {noConcertExists} = require("../middleware");
const {cloudinary} = require("../cloudinary");

module.exports = {
    async index(req,res) {
        let concerts,
            count,
            dbSearchQuery = {},
            searchQuery,
            numPerPage = parseInt(req.query.num) || 10,
            currentPage = parseInt(req.query.page) || 1,
            numOfPages,
            docsToSkip,
            sortOption = {},
            sortUrl = req.query.sort;

        //Possibly Replace these IFs with single statement
        if (req.query.search) {
            searchQuery = req.originalUrl;
            if (searchQuery.includes('page'))
                searchQuery = searchQuery.replace(/&page=[0-9]+/, '');console.log(searchQuery);
            if (searchQuery.includes('num'))
                searchQuery = searchQuery.replace(/&num=[0-9]+/, '');console.log(searchQuery);
            if (searchQuery.includes('sort'))
                searchQuery = searchQuery.replace(/&sort=.*$/, '');console.log(searchQuery);

            dbSearchQuery = {$or: [{title: new RegExp(`^${req.query.search}$`,`i`)},
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
        docsToSkip = numPerPage * (req.query.page - 1);
        concerts = await Concert.find(dbSearchQuery, '', {sort: sortOption, skip: docsToSkip, limit: numPerPage});
        res.render("concerts/index",{concerts, searchQuery, 
            textQuery: req.query.search, numPerPage, currentPage, numOfPages, sortUrl});
    },
    renderNew(req,res) {
        res.render("concerts/new");
    },
    async createNew(req,res){
        let concert = new Concert(req.body.concert);
        concert.author = req.user._id;
        concert.image = {url: req.file.path, filename: req.file.filename};
        let geoData = await geocoder.forwardGeocode({
            query: concert.location,
            limit: 1
        }).send();
        concert.geometry = geoData.body.features[0].geometry;
        await concert.save();
        req.flash('success', 'Concert Created!');
        res.redirect(`/concerts/${concert._id}`);
    },
    async renderConcert(req,res){
        try{
            let concert = await Concert.findById(req.params.id)
            .populate({path: 'reviews', populate: {path: 'author'}})
            .populate('author', 'username');
            res.render("concerts/details",{concert});
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
        let imageNew = {url: req.file.path, filename: req.file.filename};
        await Concert.findByIdAndUpdate(req.params.id,{$set: {image: imageNew}});
        req.flash('success', 'Photo Updated!');
        res.redirect(`/concerts/${req.params.id}`);
    },
    async deleteConcertPhoto(req,res) {
        let concert = await Concert.findById(req.params.id);
        if (concert.image.filename) {
            await cloudinary.uploader.destroy(concert.image.filename);
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
        await Concert.findByIdAndDelete(req.params.id);
        req.flash('successDeleted', 'Concert Deleted!');
        res.redirect('/concerts');
    }
}