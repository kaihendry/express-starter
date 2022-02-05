'use strict';

const PORT = process.env.PORT || 3000;

var Crypto = require('crypto');
var Fs = require('fs').promises;
var Http = require('http');

var BodyParser = require('body-parser');
var Eta = require('eta');
var express = require('express');
var morgan = require('morgan');

var app = require('@root/async-router').Router();
var server = express().use('/', app);
var urlencodedParser = BodyParser.urlencoded({ extended: false });

app.use(morgan('dev'));

app.engine('eta', Eta.renderFile);
app.set('view engine', 'eta');

if ('production' !== process.env.NODE_ENV) {
    app.set('json spaces', 2);
}

app.get('/', async function (req, res) {
    res.render('template', {
        nric: 'S7777777P',
        time: new Date().toISOString(),
    });
});

app.use('/fill', urlencodedParser);

app.post('/fill', async function (req, res) {
    var err;
    var rawdata;
    var updatedArt;
    
    if (!req.body?.nric) {
        err = new Error('Please submit your NRIC');
        err.status = 400;
        throw err;
    }

    //let rawdata = await Fs.readFile('./fixtures/pdt_art_with_nric_unwrapped.json', 'utf8');
    //let art = JSON.parse(rawdata);
    rawdata = require('./fixtures/pdt_art_with_nric_unwrapped.json');

    updatedArt = updateNRIC(art, req.body.nric);

    res.json(updatedArt);
});

app.use('/', function (err, req, res, next) {
    res.statusCode = err.status || 500;
    if (err.status >= 500) {
        var id = Crypto.randomUUID().slice(-12);
        console.error(`ID: ${id}`);
        console.error(err.stack);
        res.json({
            id: id,
            message: `Internal Server Error ID#${id}`,
        });
        return;
    }
    
    res.json({
        message: err.message,
        status: err.status,
        code: err.code,
    });
});

var httpServer = Http.createServer(app);
httpServer.listen(PORT, function () {
    var address = httpServer.address();
    console.log(`listening to requests on`, address);
});

function updateNRIC(art, newNRIC) {
    if (!newNRIC.match(/^[A-Z].{7}[A-Z]$/)) {
        throw new Error('Invalid or missing NRIC/FIN');
    }

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
};