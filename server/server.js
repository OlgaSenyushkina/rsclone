const express = require('express');
const cors = require('cors');
const https = require('https');

const app = express();
app.use(cors());

app.get('/api/flights', async (req, res) => {
  await https.get(`https://data-live.flightradar24.com/zones/fcgi/feed.js?bounds=${req.query.bounds}&faa=1&satellite=1&mlat=1&flarm=1&adsb=1&gnd=0&air=1&vehicles=1&estimated=1&maxage=14400`, responseHandler(res))
});

app.get('/api/fly', async (req, res) => {
  await https.get(`https://data-live.flightradar24.com/clickhandler/?version=1.5&flight=${req.query.flightCode}`, responseHandler(res))
});

app.get('/api/airport', async (req, res) => {
  await https.get(`https://api.flightradar24.com/common/v1/airport.json?code=${req.query.airportCode}&plugin[]=details&plugin[]=runways&plugin[]=satelliteImage&plugin[]=scheduledRoutesStatistics&plugin[]=weather&plugin-setting[satelliteImage][scale]=1`, responseHandler(res))
});

app.get('/api/rating', async (req, res) => {
  await https.get(`https://www.flightradar24.com/airports/myfr24-ratings?iata=${req.query.airportCode}`, responseHandler(res))
});

app.get('/api/schedule', async (req, res) => {
  await https.get(`https://api.flightradar24.com/common/v1/airport.json?code=${req.query.airportCode}&plugin[]=schedule&plugin-setting[schedule][mode]=${req.query.mode}&plugin-setting[schedule][timestamp]=${req.query.timestamp}&page=1&limit=100`, responseHandler(res))
});

app.listen(3000, () => {
    console.log('used 3000 port for server');
})

function responseHandler(res) {
  return (resp) => {
    let data = '';

    // A chunk of data has been received.
    resp.on('data', (chunk) => {
      data += chunk;
    });

    // The whole response has been received. Print out the result.
    resp.on('end', () => {
      res.send(data);
    });
  };
}