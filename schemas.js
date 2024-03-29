const Joi = require("joi");

module.exports.concertSchema = Joi.object({
    concert: Joi.object({
        title: Joi.string().required(),
        location: Joi.string().required(),
        price:Joi.number().required().min(0),
        description: Joi.string().required(),
        attendees: Joi.array(),
    }).required(),
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required()
    }).required()
});