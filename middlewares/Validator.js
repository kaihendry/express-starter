'use strict';
//* https://github.com/tayfunakgc/express-joi-validation/tree/master/middlewares
const createHttpError = require('http-errors');
//* Include all validators
const Validators = require('../validators');

module.exports = function (validator) {
    //! If validator is not exist, throw err
    if (!Validators.hasOwnProperty(validator)) {
        throw new Error(`'${validator}' validator is not exist`);
    }

    return async function (req, res, next) {
        try {
            const validated = await Validators[validator].validateAsync(
                req.body,
            );
            req.body = validated;
            next();
        } catch (err) {
            if (err.isJoi) {
                return next(createHttpError(400, { message: err.message }));
            }
            next(createHttpError(500));
        }
    };
};
