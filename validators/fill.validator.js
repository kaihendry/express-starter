const Joi = require('joi');

const fillSchema = Joi.object({
    code: Joi.string()
        .regex(/^[0-9]{3}$/)
        .required(),
});

module.exports = fillSchema;
