const ObjectId = require('mongoose').Types.ObjectId;
const User = require('../models/user');

module.exports = {
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