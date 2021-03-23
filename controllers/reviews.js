const Concert = require("../models/concert");
const Review = require("../models/review");

module.exports = {
    async createReview(req,res) {
        const concert = await Concert.findById(req.params.id);
        const review = new Review(req.body.review);
        review.author = req.user._id;
    
        concert.reviews.push(review);
        await review.save();
        await concert.save();
        req.flash('success', 'Review Posted!');
        res.redirect(`/concerts/${concert._id}`);
    },
    async deleteReview(req,res) {
        const {id, reviewId} = req.params;
        await Concert.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
        await Review.findByIdAndDelete(reviewId);
        req.flash('successDeleted', 'Review Removed!');
        res.redirect(`/concerts/${id}`);
    }
}