const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const http = require('http');
const https = require('https');


const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;;

app.use(cors());
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
    extended: true
}));

const baseUrl = "https://fr.dofus.dofapi.fr";

app.post('/dofapi/equip', (req, res) => {

    let response = null;
    let types = req.body && req.body.Types ? req.body.Types : [];

    let startingLevel = req.body && req.body.StartingLevel ? req.body.StartingLevel : 0;

    let endpoint = types.some(t => t ==="Dague" || t === "Baguette") ? "/weapons" : "/equipments";

    let apiUrl = baseUrl + endpoint;


    

    axios.get(apiUrl + `?filter={"where":{"type":{"inq":${JSON.stringify(types)}},"and":[{"level":{"lte":199}},{"level":{"gte":${startingLevel}}}]},"fields":["name","level","statistics","imgUrl"],"order":["level","ASC"],"limit":9999}`)
        .then((equip) => {
            response = equip.data;
        })
        .catch((error) => {

            response = error;
        })
        .then(() => {
            res.send(response || {});

        });
});

app.post('/ankama/imgB64', (req, res) => {

    let providedUrl = req.body.imgUrl.replace("https://s.ankama.com/www/", "https://");

    https.get(providedUrl, (resp) => {
        resp.setEncoding('base64');
        let body = "data:" + resp.headers["content-type"] + ";base64,";
        resp.on('data', (data) => { body += data});
        resp.on('end', () => {
            //console.log(body);
            return res.json({result: body, status: 'success'});
        });
    }).on('error', (e) => {
        console.log(`Got error: ${e.message}`);
        return res.json({result: e, status: 'error'});

    });
})

app.listen(port, () => {
    console.log(`Mock API listening at http://localhost:${port}`)
});