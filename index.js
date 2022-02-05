var express = require('express');
var eta = require('eta');
var bodyParser = require('body-parser');
var morgan = require('morgan');

var app = express();

app.use(morgan('dev'));

app.engine('eta', eta.renderFile);
app.set('view engine', 'eta');
app.set('json spaces', 2);

var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.get('/', function (req, res) {
    res.render('template', {
        nric: 'S7777777P',
        time: new Date().toISOString(),
    });
});

app.post('/fill', urlencodedParser, function (req, res, next) {
    if (!req.body?.nric) {
        res.status(400).send('Please submit your NRIC');
        return;
    }

    const fs = require('fs');

    let rawdata = fs.readFileSync('fixtures/pdt_art_with_nric_unwrapped.json');
    let art = JSON.parse(rawdata);

    const updatedArt = updateNRIC(art, req.body.nric);

    res.json(updatedArt);
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log(`listening to requests on port ${port}`);
});

updateNRIC = function (art, newNRIC) {
    if (!newNRIC.match(/^[A-Z].{7}[A-Z]$/)) {
        throw new Error('Invalid or missing NRIC/FIN');
    }

    art.fhirBundle.entry // https://stackoverflow.com/a/70920413/4534
        .flatMap((entry) => entry.resource)
        .find((entry) => entry.resourceType === 'Patient')
        .identifier.find((entry) => entry.id === 'NRIC-FIN').value = newNRIC;

    return art;
};
