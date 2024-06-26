
// Comienza a ejecutar el código JavaScript solo si se ha cargado todo el archivo HTML 
// Añade el mapa leaflet a la página y establece su vista inicial
// Añade mi capa de colores personalizados al mapa

document.addEventListener('DOMContentLoaded', () => {
  const map = L.map('map', {
    center: [51.505, -0.09],
    minZoom: 2,
    maxBounds: [[-90, -180], [90, 180]],
    noWrap: true
  }).setView([20, 0], 2);

  L.tileLayer('https://tile.jawg.io/907408c2-9102-4012-94a7-86c2b203d920/{z}/{x}/{y}{r}.png?access-token=XzL0eaAuqlmFuHoZrJTHdiyKwuE62EOnvOPIPTQfIYsg1o4An2M4Vo7f1gA29qMo').addTo(map);


  // Crea una nueva instancia de OpenStreetMapProvider, que es una clase de Leaflet-geosearch que permite
  // realizar búsquedas de ubicaciones utilizando los datos de OpenStreetMap. Se configura el inglés como
  // idioma preferido para los resultados de la búsqueda

  const proveedor = new window.GeoSearch.OpenStreetMapProvider({
    params: {
      'accept-language': 'en', 
    },
  }
  );


  // Establecer funciones con los estilos a utilizar para que los países se muestren de un color cuando 
  // el mouse está sobre ellos y de otro color cuando se hace click en un país concreto

  function default_estilo(feature) {
    return {
      color: "transparent",
      fillColor: "transparent",
      weight: 1
    };
  }
  
  function hover_estilo(feature) {
    return {
      color: "#294039",
      fillColor: "#294039",
      weight: 2
    };
  }
  
  function click_estilo(feature) {
    return {
      color: "#594B22",
      fillColor: "#594B22",
      weight: 3
    };
  }


  // Las funciones on_each_feature se utilizan en objetos GeoJSON para agregar características a cada
  // feature del mapa. Aquí se utiliza para agregar los estilos en función de los eventos mouseover,
  // mouseout y click.

  function on_each_feature(feature, pais) {
    pais.on({
      mouseover: function (e) {
        if (!pais.options.clicked) {
          pais.setStyle(hover_estilo());
        }
      },
      mouseout: function (e) {
        if (!pais.options.clicked) {
          capa_geojson.resetStyle(pais);
        }
      },
      click: function (e) {
        if(uno_o_dos === 1){
          capa_geojson.resetStyle();
          pais.setStyle(click_estilo());
          pais.options.clicked = true;

        }
        else if(uno_o_dos === 2){
          if (paises_seleccionados.length === 0) {
            capa_geojson.resetStyle();
            pais.setStyle(click_estilo());
            pais.options.clicked = true;

          } else if(paises_seleccionados.length === 1 && paises_seleccionados[0] != pais){
            pais.setStyle(click_estilo());
            pais.options.clicked = true;

          }

        }
      }
    });
  }


  // Crea una nueva capa GeoJSON sin datos iniciales, a la que asigna el estilo por defecto (transparente)
  // y aplica a cada característica de la capa la función que agrega los estilos interactivos

  var capa_geojson = L.geoJson(null, {
    style: default_estilo,
    onEachFeature: on_each_feature
  }).addTo(map);


  // Carga y adición de los datos GeoJSON al mapa por medio de una función asíncrona

  async function incluir_data_geojson(url) {
    try {
      const respuesta = await fetch(url);
      const data = await respuesta.json();
      capa_geojson.addData(data);
    } catch (error) {
      console.error('Hubo un error al cargar los datos GeoJSON:', error);
    }
  }

  incluir_data_geojson('custom.geo.json');


  // Función que obtiene las coordenadas del lugar en el que se hizo click. Con esas coordenadas averigua
  // el nombre del país que se encuentra en esa posición, haciendo uso de otra función. Finalmente, si
  // obtiene el nombre del país, se ejecuta otra función para extraer datos sobre ese país

  async function encontrar_pais(e) {
    const latitud_longitud = e.latlng;
    var nombre_pais = await obtener_nombre_pais(latitud_longitud);
    if (nombre_pais) {
      if(uno_o_dos === 1){
        paises_seleccionados[0] = nombre_pais

      }
      else if(uno_o_dos === 2){
        if (paises_seleccionados.length === 0) {
          paises_seleccionados[0] = nombre_pais

        } else if(paises_seleccionados.length === 1 && paises_seleccionados[0] != nombre_pais ){
          paises_seleccionados[1] = nombre_pais
        }

      }
      console.log(nombre_pais)
      console.log(paises_seleccionados)
    } else {
      console.error('No ha sido posible obtener el nombre del país.');
    }
  }


  // Al tratar de buscar los datos del país que se encuentra en la posición sobre la que se ha hecho click,
  // estos datos se devuelven en formato string separados por comas. El nombre del país es el último elemento 
  // de esa string. Esta función convierte el string en array y extrae el su último elemento, que es el nombre
  // del país seleccionado

  function ultimo_valor_array(input_array) {
    const partes_array = input_array.split(', ');
    return partes_array[partes_array.length - 1];
  }


  // Esta función envía una consulta al proveedor de OpenStreetMap para obtener como respuesta la diracción 
  // sober la que se ha hecho click en el mapa. De entre los resultados que recibe como respuesta, escoge el
  // primero. Luego, utiliza la función creada anteriormente para convertir la dirección en array, y de ahí
  // obtener el nombre del país. En caso de error, devuelve null

  async function obtener_nombre_pais(latitud_longitud) {
    try {
      const resultado = await proveedor.search({ query: `${latitud_longitud.lat},${latitud_longitud.lng}` });
      console.log(resultado)

      if (resultado && resultado.length > 0) {
        const direccion = resultado[0].raw.display_name;
        console.log(direccion);
        if (direccion) {
          var nombre_pais = ultimo_valor_array(direccion);
          console.log(nombre_pais)
          return nombre_pais.toLowerCase();
        }
      }
      console.error('No se ha encontrado un nombre de país válido.');
      return null;

    } catch (error) {
      console.error('Hubo un error al tratar de obtener el nombre del país:', error);
      return null;
    }
  }


  // Esta función trata de obtener los datos para el país elegido. Para ello realiza una solicitud HTTP GET a
  // la URL del servidor. El servidor solicita los datos a la API de World Data Bank. Si se reciben los datos
  // correctamente, se ejecuta una función que los muestra

  async function fetch_data_pais(nombre_pais) {
    try {
        const respuesta = await fetch(`/data_pais/${nombre_pais}`);
        const data = await respuesta.json();
        console.log("Datos solicitados");
        return data;
    } catch (error) {
        console.error('Hubo un error al tratar de obtener los datos del país:', error);
        throw error;
    }
}


  // Función que muestra los datos del país

  function mostrar_datos_pais(data1, data2 = null) {
    console.log(data1);
    if (data2) {
      console.log(data2);
    }
    const container_data_pais = document.getElementById('data_pais');
    const countryInfo1 = data1[1][0];
    
    container_data_pais.innerHTML = `
        <div class="row p-3">
            <button id="resetear_button" class="btn btn-primary" style="background-color: #573A5C; border: none;">
                <i class="bi bi-x-square" ></i>
            </button>
            <h3>${countryInfo1.name} <span id="countryiso1"> ${countryInfo1.iso2Code}</span><span id="countryiso1_indicator"></span> </h3>
            ${data2 ? `<h3>${data2[1][0].name} <span id="countryiso2"> ${data2[1][0].iso2Code}</span></h3>` : ''}
            <canvas id="myLineChart" width="400" height="200"></canvas>
        </div>
    `;
    document.getElementById("resetear_button").addEventListener("click", resetear);
    
    document.querySelectorAll(".btn.button-nav.btn-primary.w-75.p-2.mb-2").forEach(button => {
      button.addEventListener("click", async (event) => {
        console.log("clicked");
        var indicator = event.target.value;
        document.getElementById("countryiso1_indicator").innerText = ` ${event.target.innerText}` ;
        const iso1 = document.getElementById("countryiso1").innerText.trim().toLowerCase();
        if (data2) {
            const iso2 = document.getElementById("countryiso2").innerText.trim().toLowerCase();
            Promise.all([
                fetch(`http://api.worldbank.org/v2/country/${iso1}/indicator/${indicator}?format=json`).then(res => res.json()),
                fetch(`http://api.worldbank.org/v2/country/${iso2}/indicator/${indicator}?format=json`).then(res => res.json())
            ]).then(([data1, data2]) => {
                displayIndicatorData(data1, data2);
            }).catch(error => {
                console.error('Hubo un error tratando de obtener datos para esa categoría:', error);
            });
        } else {
            fetch(`http://api.worldbank.org/v2/country/${iso1}/indicator/${indicator}?format=json`)
                .then(res => res.json())
                .then(data => displayIndicatorData(data))
                .catch(error => {
                    console.error('Hubo un error tratando de obtener datos para esa categoría:', error);
                });
        }
      });
    });

}
  let myLineChart;

  function displayIndicatorData(data1, data2 = null) {
    console.log(data1, data2);

    const filteredData1 = data1[1]
    const labels = filteredData1.map(item => item.date);
    

    const values1 = filteredData1.map(item => item.value);


    let datasets = [{
        label: paises_seleccionados[0].toUpperCase(),
        data: values1.reverse(),
        borderColor: 'rgb(75, 192, 192)',
        fill: false,
        tension: 0.1
    }];

    if (data2) {
        const filteredData2 = data2[1]
        const values2 = filteredData2.map(item => item.value);
        datasets.push({
            label: paises_seleccionados[1].toUpperCase(),
            data: values2.reverse(),
            borderColor: 'rgb(255, 99, 132)',
            fill: false,
            tension: 0.1
        });
    }

    const ctx = document.getElementById('myLineChart').getContext('2d');

    if (myLineChart) {
        myLineChart.destroy();
    }

    myLineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels.reverse(),
            datasets: datasets
        },
        options: {
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Year'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        
                    }
                }
            }
        }
    });
}


  // Manejar la extracción de datos en función de si se desea consultar un solo país o comparar dos países. Si solo se
  // desea consultar un país, este se registra en el array paises_seleccionados y se extraen los datos elegidos. Si se
  // van a comparar dos países, 

  var paises_seleccionados = [];

  
  

  function resetear() {

    paises_seleccionados = [];
  
    capa_geojson.eachLayer(function (pais) {
      pais.options.clicked = false;
      capa_geojson.resetStyle(pais);
    });
    volver_atras()
    document.getElementById('data_pais').style.display = 'none';
    document.getElementById('button-container').style.display = 'block';
    document.getElementById('map').style.display = 'block';
    document.getElementById('menu_principal').style.display = 'none';
    document.getElementById('inicio').style.display = 'block';
    
  }
  
  document.getElementById('button_reset').addEventListener('click', resetear);


  // Esta función cambia los estilos de los botones que el usuario puede utilizar para indicar si quiere 
  // consultar datos sobre un único país, o si quiere comparar dos países. Además, registra los valores 
  // "1" o "2" en base al botón seleccionado, para utilizarlos en la función que muestra los datos
  
  function uno_o_dos_paises(id_button) {
    document.getElementById(id_button).style.backgroundColor = '#573A5C';
    if (id_button === 'un_pais') {
      document.getElementById('dos_paises').style.backgroundColor = '#a19ca2';
      uno_o_dos = 1;
      resetear(); // Resetear el mapa cuando se cambia a un país
      console.log(uno_o_dos);
    } else {
      document.getElementById('un_pais').style.backgroundColor = '#a19ca2';
      uno_o_dos = 2;
      resetear(); // Resetear el mapa cuando se cambia a dos países
      console.log(uno_o_dos);
    }
  }
  
  document.getElementById("un_pais").addEventListener("click",() => {uno_o_dos_paises("un_pais")} );
  document.getElementById("dos_paises").addEventListener("click", () => {uno_o_dos_paises("dos_paises")});
  // Función para vaciar el array de países seleccionados y poder comenzar la selección de nuevo


  // Agregar event listener para el botón "button_go"
  document.getElementById('button_go').addEventListener('click', () => {
    mostrar_overlay();
  });

  // Función para mostrar el overlay
  function mostrar_overlay() {
    const overlay = document.getElementById('data_pais');
    overlay.style.display = 'block';
    document.getElementById('menu_principal').style.display= 'block';
    document.getElementById('button-container').style.display = 'none';
    document.getElementById('map').style.display = 'none';
    document.getElementById('inicio').style.display = 'none';
    
    if (uno_o_dos === 1 && paises_seleccionados.length === 1) {
      Promise.all([
        fetch_data_pais(paises_seleccionados[0])
    ]).then(([data1]) => {
            console.log(data1)
            mostrar_datos_pais(data1);
        });
    } else if (uno_o_dos === 2 && paises_seleccionados.length === 2) {
        Promise.all([
            fetch_data_pais(paises_seleccionados[0]),
            fetch_data_pais(paises_seleccionados[1])
        ]).then(([data1, data2]) => {
            mostrar_datos_pais(data1, data2);
        }).catch(error => {
            console.error('Error fetching data for both countries:', error);
        });
    } 
}

    // Asignar al mapa la función de encontrar el país cuando se haga click sobre el mapa

    map.on('click', encontrar_pais);
});


// Función para mostrar los submenús de las distintas categorías. Al hacer click en una de las categorías
// que aparecen inicialmente en la interfaz, esta interfaz principal desaparece y se muestra el submenú
// correspondiente a la categoría seleccionada

function mostrar_submenu(container_id) {

  document.getElementById('menu_principal').style.display = 'none';

  document.getElementById(container_id).style.display = 'block';
}


//Función para volver al menú principal desde los submenús

function volver_atras() {
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

document.querySelectorAll(".button-volver-atras").forEach(function(button) {
  button.addEventListener('click', volver_atras);
});


