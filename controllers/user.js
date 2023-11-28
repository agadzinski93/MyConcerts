const ExpressError = require('../utilities/ExpressError');
const ObjectId = require('mongoose').Types.ObjectId;
const User = require('../models/user');
const Concert = require('../models/concert');

module.exports = {
    async renderUser(req,res,next) {
        try {
            const userID = req.params.id;
            const user = await User.findById(userID)
                .populate({path:'followers', model:'user', select:'username image'});
            const concerts = await Concert.find({author:{$eq: new ObjectId(userID)}}, {"title":1,"price":1,"location":1,"image":1,"description":1});
            res.render('users/details', {layout:'layout/noNav',user, concerts});
        } catch(err) {
            console.error(`${new Date(Date.now()).toString()} - Fetch User Error - ${err.message}`);
            next(new ExpressError("User Does Not Exist",400));
        }
    },
    async followUser(req, res) {
        const currentUserId = req.body.myId;
        const authorId = req.body.authorId;

        let result = null;
        try {
            const write = [
                {
                    updateOne: {
                        filter: {'_id' : new ObjectId(authorId)},
                        update: {$addToSet: { followers: new ObjectId(currentUserId) }}
                    },
                },
                {
                    updateOne: {
                        filter: {'_id' : new ObjectId(currentUserId)},
                        update: {$addToSet: { following: new ObjectId(authorId) }}
                    },
                },
            ];
            result = await User.bulkWrite(write);
        } catch(err) {
            console.error(`${new Date(Date.now()).toString()} - Error Following User - ${err.message}`);
        }
        res.json(result);
    },
    async unFollowUser(req, res) {
        const currentUserId = req.body.myId;
        const authorId = req.body.authorId;

        let result = null;
        try {
            const write = [
                {
                    updateOne: {
                        filter: {'_id' : new ObjectId(authorId)},
                        update: {$pull: { followers: new ObjectId(currentUserId) }}
                    },
                },
                {
                    updateOne: {
                        filter: {'_id' : new ObjectId(currentUserId)},
                        update: {$pull: { following: new ObjectId(authorId) }}
                    },
                },
            ];
            result = await User.bulkWrite(write);
        } catch(err) {
            console.error(`${new Date(Date.now()).toString()} - Error Unfollowing User - ${err.message}`);
        }
        res.json(result);
    }
}