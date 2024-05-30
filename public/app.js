// public/script.js
document.addEventListener('DOMContentLoaded', () => {
  const map = L.map('map').setView([20, 0], 2);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  const provider = new window.GeoSearch.OpenStreetMapProvider();

  async function onMapClick(e) {
    const latlng = e.latlng;
    const countryName = await getCountryName(latlng);
    if (countryName) {
      fetchCountryData(countryName);
    } else {
      console.error('Country name could not be retrieved.');
    }
  }

  function getLastValue(inputString) {
    const parts = inputString.split(', ');
    return parts[parts.length - 1];
  }

  async function getCountryName(latlng) {
    try {
      const results = await provider.search({ query: `${latlng.lat},${latlng.lng}` });
      console.log('Geocoding results:', results); // Log the results for debugging

      if (results && results.length > 0) {
        const address = results[0].raw.display_name;
        console.log(address);
        if (address) {
          var countryName = getLastValue(address);
          console.log(countryName)
          return countryName.toLowerCase();
        }
      }

      console.error('No valid country name found in the geocoding results.');
      return null;
    } catch (error) {
      console.error('Error fetching country name:', error);
      return null;
    }
  }

  async function fetchCountryData(countryName) {
    try {
      const response = await fetch(`/country-data/${countryName}`);
      const data = await response.json();
      console.log("requested data");
      displayCountryData(data);
    } catch (error) {
      console.error('Error fetching country data:', error);
    }
  }

  function displayCountryData(data) {
    console.log(data);
    const countryDataDiv = document.getElementById('country-data');
    if (data[1] && data[1][0]) {
      const countryInfo = data[1][0];
      countryDataDiv.innerHTML = `
      <div class="row p-3">
        <h3>${countryInfo.name} <span id="countryiso"> ${countryInfo.iso2Code}</span></h3>
        <p>Region: ${countryInfo.region.value}</p>
        <p>Income Level: ${countryInfo.incomeLevel.value}</p>
        <p>Capital City: ${countryInfo.capitalCity}</p>

        <h2>Select an indicator:</h2>
        <select id="indicator-select">
          <option value="NY.GDP.MKTP.CD">GDP (current US$)</option>
          <option value="SP.POP.TOTL">Population, total</option>
          <option value="SP.DYN.LE00.IN">Life expectancy at birth, total (years)</option>
          <option value="FP.CPI.TOTL.ZG">Inflation, consumer prices (annual %)</option>
          <option value="SL.UEM.TOTL.ZS">Unemployment, total (% of total labor force)</option>
          <option value="AG.LND.FRST.ZS">Forest area (% of land area)</option>
        </select>
        <button class="btn btn-primary mt-3" id="getdata">Get Data</button>

        <div id="indicator-data"></div>
      </div>
      `;

      document.getElementById("getdata").addEventListener("click", async () => {
        console.log("clicked");
        var iso = document.getElementById("countryiso").innerText.trim().toLowerCase();
        var indicator = document.getElementById("indicator-select").value;
        try {
          const response = await fetch(`http://api.worldbank.org/v2/country/${iso}/indicator/${indicator}?format=json`);
          const data = await response.json();
          displayIndicatorData(data);
        } catch (error) {
          console.error('Error fetching indicator data:', error);
        }
      });
    } else {
      countryDataDiv.innerHTML = `<p>No data available for this country.</p>`;
    }
  }

  function displayIndicatorData(data) {
    const indicatorDataDiv = document.getElementById('indicator-data');
    if (data[1] && data[1].length > 0) {
      indicatorDataDiv.innerHTML = `
        <h4>Indicator Data:</h4>
        <ul>
          ${data[1].map(item => `<li>${item.date}: ${item.value ? item.value : 'No data available'}</li>`).join('')}
        </ul>
      `;
    } else {
      indicatorDataDiv.innerHTML = `<p>No data available for this indicator.</p>`;
    }
  }

  map.on('click', onMapClick);
});

  