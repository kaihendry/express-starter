'use strict';

// const PORT = process.env.PORT || 3000;
// const Http = require('http');

const BodyParser = require('body-parser');
const CreateHttpError = require('http-errors');
const Eta = require('eta');
const Express = require('express');
const Morgan = require('morgan');
const Serverless = require('serverless-http');

const app = Express();

const urlencodedParser = BodyParser.urlencoded({ extended: false });

app.use(Morgan('tiny'));

app.engine('eta', Eta.renderFile);
app.set('view engine', 'eta');

if ('production' !== process.env.NODE_ENV) {
    app.set('json spaces', 2);
}

app.get('/', function (req, res) {
    res.render('template', {
        code: '200',
    });
});

const fillRouter = require('./routes/fill');
app.use('/fill', urlencodedParser);
app.post('/fill', fillRouter);

app.use((req, res, next) => {
    next(CreateHttpError(404));
});

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    if (err.response) {
        res.json({
            error: {
                status: err.status || 500,
                message: err.message,
                response: err.response.data,
            },
        });
    } else {
        res.json({
            error: {
                status: err.status || 500,
                message: err.message,
            },
        });
    }
});

// var httpServer = Http.createServer(app);
// httpServer.listen(PORT, function () {
//     var address = httpServer.address();
//     console.log(`listening to requests on`, address);
// });

module.exports.handler = Serverless(app);
