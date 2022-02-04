var express = require('express');
var app = express();
var eta = require('eta');
var bodyParser = require('body-parser');

app.engine('eta', eta.renderFile);
app.set('view engine', 'eta');
app.set('views', './views');

var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.get('/', function (req, res) {
    res.render('template', {
        nric: 'S7777777P',
        time: new Date().toISOString(),
    });
});

app.post('/fill', urlencodedParser, function (req, res) {
    if (!req.body?.nric) {
        res.send('Please submit your NRIC');
        return;
    }

    const fs = require('fs');

    let rawdata = fs.readFileSync('fixtures/pdt_art_with_nric_unwrapped.json');
    let art = JSON.parse(rawdata);

    const updatedArt = updateNRIC(art, req.body.nric);

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(updatedArt, null, 2));
});

app.listen(8000, function () {
    console.log('listening to requests on port 8000');
});

updateNRIC = function (art, newNRIC) {
    if (!newNRIC.match(/^[A-Z].{7}[A-Z]$/)) {
        // TODO: Figure out to return this as a bad request
        throw 'Invalid or missing NRIC/FIN';
    }

    // https://stackoverflow.com/a/70920413/4534
    art.fhirBundle.entry
        .flatMap((entry) => entry.resource)
        .find((entry) => entry.resourceType === 'Patient')
        .identifier.find((entry) => entry.id === 'NRIC-FIN').value = newNRIC;

    return art;
};
