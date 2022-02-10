'use strict';

const express = require('express');
const router = express.Router();
const Validator = require('../middlewares/Validator');
const axios = require('axios');

router.post('/fill', Validator('fill'), async (req, res, next) => {
    try {
        const response = await axios.get(
            'https://httpstat.us/' + req.body.code,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        );
        res.json(response.data);
    } catch (error) {
        console.log('Message', error.message);
        console.error(error.response.data);
        next(error);
    }
});

module.exports = router;
