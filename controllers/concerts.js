const Concert = require("../models/concert");
const {concertExists} = require("../middleware");

module.exports = {
    async index(req,res) {
        let concerts = await Concert.find({});
        res.render("concerts/index",{concerts});
    },
    renderNew(req,res) {
        res.render("concerts/new");
    },
    async createNew(req,res){
        let concert = new Concert(req.body.concert);
        concert.author = req.user._id;
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
    async deleteConcert(req,res) {
        await Concert.findByIdAndDelete(req.params.id);
        req.flash('successDeleted', 'Concert Deleted!');
        res.redirect('/concerts');
    }
}