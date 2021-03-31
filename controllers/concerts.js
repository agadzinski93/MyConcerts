const Concert = require("../models/concert");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});
const {concertExists} = require("../middleware");
const {cloudinary} = require("../cloudinary");

module.exports = {
    async index(req,res) {
        let concerts,
            count,
            dbSearchQuery = {},
            searchQuery,
            numPerPage = parseInt(req.query.num) || 10,
            numOfPages,
            docsToSkip,
            sortOption = {},
            sortUrl = req.query.sort;

        //Possibly Replace these IFs with single statement
        if (req.query.search) {
            searchQuery = req.originalUrl;
            if (searchQuery.includes('page'))
                searchQuery = searchQuery.replace(/&page=./, '');
            if (searchQuery.includes('num'))
                searchQuery = searchQuery.replace(/&num=./, '');
            if (searchQuery.includes('sort'))
                searchQuery = searchQuery.replace(/&sort=.*$/, '');

            dbSearchQuery = {title: new RegExp(`^${req.query.search}$`,`i`)};
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

        res.render("concerts/index",{concerts, searchQuery, numPerPage, numOfPages, sortUrl});
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
        let concert = await Concert.findById(req.params.id)
            .populate({path: 'reviews', populate: {path: 'author'}})
            .populate('author', 'username');
        concertExists(concert);
        res.render("concerts/details",{concert});
    },
    async renderEditConcert(req,res){
        let concert = await Concert.findById(req.params.id);
        concertExists(concert);
        res.render(`concerts/edit`,{concert});
    },
    async editConcert (req,res) {
        await Concert.findByIdAndUpdate(req.params.id,{...req.body.concert});
        req.flash('success', 'Concert Updated!');
        res.redirect(`/concerts`);
    },
    async renderEditConcertPhoto(req,res){
        let concert = await Concert.findById(req.params.id);
        concertExists(concert);
        res.render(`concerts/editPhoto`,{concert});
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