const Joi = require('joi');

const fillSchema = Joi.object({
    nric: Joi.string()
        .regex(/^[A-Z][0-9]{7}[A-Z]$/)
        .required(),
});

module.exports = fillSchema;
