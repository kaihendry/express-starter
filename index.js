'use strict';

const PORT = process.env.PORT || 3000;

var Http = require('http');

var axios = require('axios');
var express = require('express');
var morgan = require('morgan');

var app = express().use('/', require('@root/async-router').Router());

app.use(morgan('dev'));

app.get('/', async function (req, res) {
    // how come the error is not being handled??
    throw new Error('This is a test error');

    let octocat = await axios.get('https://api.github.com/users/octocat');
    res.json(octocat.data);
});

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
        error: {
            status: err.status || 500,
            message: err.message,
        },
    });
});

var httpServer = Http.createServer(app);
httpServer.listen(PORT, function () {
    var address = httpServer.address();
    console.log(`listening to requests on`, address);
});
