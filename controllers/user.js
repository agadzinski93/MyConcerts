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
            const concerts = await Concert.find({author:{$eq:ObjectId(userID)}}, {"title":1,"price":1,"location":1,"image":1,"description":1});
            res.render('users/details', {user, concerts});
        } catch(e) {
            next(new ExpressError("User Does Not Exist",400));
        }
    },
    async followUser(req, res) {
        const currentUserId = req.body.myId;
        const authorId = req.body.authorId;

        const write = [
            {
                updateOne: {
                    filter: {'_id' : ObjectId(authorId)},
                    update: {$addToSet: { followers: ObjectId(currentUserId) }}
                },
            },
            {
                updateOne: {
                    filter: {'_id' : ObjectId(currentUserId)},
                    update: {$addToSet: { following: ObjectId(authorId) }}
                },
            },
        ];

        const result = await User.bulkWrite(write);
        res.json(result);
    },
    async unFollowUser(req, res) {
        const currentUserId = req.body.myId;
        const authorId = req.body.authorId;

        const write = [
            {
                updateOne: {
                    filter: {'_id' : ObjectId(authorId)},
                    update: {$pull: { followers: ObjectId(currentUserId) }}
                },
            },
            {
                updateOne: {
                    filter: {'_id' : ObjectId(currentUserId)},
                    update: {$pull: { following: ObjectId(authorId) }}
                },
            },
        ];

        const result = await User.bulkWrite(write);
        res.json(result);
    }
}