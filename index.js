'use strict';

const PORT = process.env.PORT || 3000;

const Http = require('http');

const BodyParser = require('body-parser');
const Eta = require('eta');
const Express = require('express');
const CreateHttpError = require('http-errors');
const Morgan = require('morgan');

const app = Express();

const urlencodedParser = BodyParser.urlencoded({ extended: false });

app.use(Morgan('dev'));

app.engine('eta', Eta.renderFile);
app.set('view engine', 'eta');

if ('production' !== process.env.NODE_ENV) {
    app.set('json spaces', 2);
}

app.get('/', function (req, res) {
    res.render('template', {
        nric: 'S7777777P',
        time: new Date().toISOString(),
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
