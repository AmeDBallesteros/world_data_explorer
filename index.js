// server.js
const express = require('express');
const axios = require('axios');
const path = require('path');
//const fetch = require('node-fetch');
const app = express();
const port = 3000;
const countrytoiso = require('country-to-iso');


app.use(express.static('public'));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'app.html'));
  });
app.get('/country-data/:countryName', async (req, res) => {
  const countryName = req.params.countryName;
  const countryCode = countrytoiso.countryToAlpha2(countryName)
  console.log(`requested country ${countryName} , ${countryCode}`);
  
  try {
    const response = await axios.get(`http://api.worldbank.org/v2/country/${countryCode}?format=json`);
    res.json(response.data);
  } catch (error) {
    res.status(500).send('Error retrieving data');
  }

    // try {
    //     fetch(`http://api.worldbank.org/v2/country/${countryCode}?format=json`)
    //         .then((response) => response.json())
    //         .then((data) => console.log(data));
    // } catch (error) {
    //     res.status(500).send('Error retrieving data');
    // }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
