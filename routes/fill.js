'use strict';

const art = require('../fixtures/pdt_art_with_nric_unwrapped.json');

const express = require('express');
const router = express.Router();
const Validator = require('../middlewares/Validator');

router.post('/fill', Validator('fill'), (req, res, next) => {
    Promise.resolve(async function () {
        throw new Error('This aaaa is a test error');
        res.json(updateNRIC(art, req.body.nric));
    }).catch(next);
});

function updateNRIC(art, newNRIC) {
    // https://stackoverflow.com/a/70920413/4534
    var entry = art.fhirBundle.entry
        .flatMap(function (entry) {
            return entry.resource;
        })
        .find(function (entry) {
            return 'Patient' === entry.resourceType;
        })
        .identifier.find(function (entry) {
            return entry.id === 'NRIC-FIN';
        });

    entry.value = newNRIC;

    return art;
}

module.exports = router;
