// public/script.js



document.addEventListener('DOMContentLoaded', () => {
  const map = L.map('map', {
    center: [51.505, -0.09],
    minZoom: 2,
    maxBounds: [[-90, -180], [90, 180]],
    noWrap: true
  }).setView([20, 0], 2);


  L.tileLayer('https://tile.jawg.io/907408c2-9102-4012-94a7-86c2b203d920/{z}/{x}/{y}{r}.png?access-token=XzL0eaAuqlmFuHoZrJTHdiyKwuE62EOnvOPIPTQfIYsg1o4An2M4Vo7f1gA29qMo').addTo(map);

  const provider = new window.GeoSearch.OpenStreetMapProvider({
    params: {
      'accept-language': 'en', // render results in Dutch
    },
  }
  );
  let selectedCountries = [];
  // Estilo por defecto con relleno transparente
  function defaultStyle(feature) {
    return {
      color: "transparent",
      fillColor: "transparent",
      weight: 1
    };
  }
  // Estilo para hover
  function highlightStyle(feature) {
    return {
      color: "#294039",
      fillColor: "#294039",
      weight: 2
    };
  }
  // Estilo para clic
  function clickStyle(feature) {
    return {
      color: "#594B22",
      fillColor: "#594B22",
      weight: 3
    };
  }
  function onEachFeature(feature, layer) {
    layer.on({
      mouseover: function (e) {
        if (!layer.options.clicked) {
          layer.setStyle(highlightStyle());
        }
      },
      mouseout: function (e) {
        if (!layer.options.clicked) {
          geojsonLayer.resetStyle(layer);
        }
      },
      click: function (e) {
        geojsonLayer.eachLayer(function (layer) {
          layer.options.clicked = false;
          geojsonLayer.resetStyle(layer);
        });
        layer.setStyle(clickStyle());
        layer.options.clicked = true;
        var countryName = feature.properties.name;
        fetchCountryData(countryName);
      }
    });
  }
  var geojsonLayer = L.geoJson(null, {
    style: defaultStyle,
    onEachFeature: onEachFeature
  }).addTo(map);
  function addGeoJSONData(data) {
    geojsonLayer.addData(data);
  }
  async function addGeoJSONDataFromFile(url) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      geojsonLayer.addData(data);
    } catch (error) {
      console.error('Error loading GeoJSON data:', error);
    }
  }

  addGeoJSONDataFromFile('custom.geo.json');


  async function onMapClick(e) {
    const latlng = e.latlng;
    var countryName = await getCountryName(latlng);
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
      </div>
      `;

      document.querySelectorAll(".btn.button-nav.btn-primary.w-100").forEach(button => {
        button.addEventListener("click", async (event) => {
          console.log("clicked");
          var iso = document.getElementById("countryiso").innerText.trim().toLowerCase();
          var indicator = event.target.value;
          try {
            const response = await fetch(`http://api.worldbank.org/v2/country/${iso}/indicator/${indicator}?format=json`);
            const data = await response.json();
            displayIndicatorData(data);
          } catch (error) {
            console.error('Error fetching indicator data:', error);
          }
        });
      });
    } else {
      countryDataDiv.innerHTML = `<p>No data available for this country.</p>`;
    }
  }

  function displayIndicatorData(data) {
    console.log(data);

  }



  map.on('click', onMapClick);
});


//Función para volver atrás desde los submenús
function volver_atras() {
  document.getElementById('h2_categorias').style.display = 'block';
  document.getElementById('menu_principal').style.display = 'block';
  document.getElementById('container_bienestar_social').style.display = 'none';
  document.getElementById('container_cultura').style.display = 'none';
  document.getElementById('container_demografia').style.display = 'none';
  document.getElementById('container_educacion').style.display = 'none';
  document.getElementById('container_economia').style.display = 'none';
  document.getElementById('container_genero').style.display = 'none';
  document.getElementById('container_medioambiente').style.display = 'none';
  document.getElementById('container_migraciones').style.display = 'none';
  document.getElementById('container_politica').style.display = 'none';
  document.getElementById('container_seguridad').style.display = 'none';
}


button_volver_atras.onclick = volver_atras;


function mostrar_submenu(container_id) {

  document.getElementById('h2_categorias').style.display = 'none';
  document.getElementById('menu_principal').style.display = 'none';

  document.getElementById(container_id).style.display = 'block';
}

var uno_o_dos = 1;

function uno_o_dos_paises(id_button){
  document.getElementById(id_button).style.backgroundColor='#573A5C';
  if (id_button==='un_pais') {
    document.getElementById('dos_paises').style.backgroundColor='#a19ca2';
    var uno_o_dos = 1;
    console.log(uno_o_dos)
  } else {
    document.getElementById('un_pais').style.backgroundColor='#a19ca2';
    var uno_o_dos = 2; 
    console.log(uno_o_dos)
  }
}

