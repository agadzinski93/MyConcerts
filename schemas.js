const Joi = require("joi");

module.exports.concertSchema = Joi.object({
    concert: Joi.object({
        title: Joi.string().required(),
        location: Joi.string().required(),
        price:Joi.number().required().min(0),
        image: Joi.string().required(),
        descrption: Joi.string().required()
    }).required()
});