// VALIDATION
const Joi = require('joi');

// API Register validation
const registerValidation = (data) => {
    const userSchema = Joi.object({
        username: Joi.string()
            .alphanum()
            .min(3)
            .max(30)
            .required(),

        password: Joi.string()
            .min(6)
            .max(40)
            .required(),

        repeat_password: Joi.ref('password'),
    })
        .with('username', 'password')
        .with('password', 'repeat_password');

    return userSchema.validate(data);
};

// API Login validation
const loginValidation = (data) => {
    const userSchema = Joi.object({
        username: Joi.string()
            .alphanum()
            .min(3)
            .max(30)
            .required(),

        password: Joi.string()
            .min(6)
            .max(40)
            .required(),
    })
        .with('username', 'password');

    return userSchema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;