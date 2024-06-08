// Módulo que permite crear aplicaciones web con Node.js
const express = require('express');

// Módulo para hacer solicitudes HTTP con soporte para promesas
const axios = require('axios');

// Módulo que permite trabajar con rutas de archivos y directorios
const path = require('path');

// Módulo para convertir nombres de países a su código ISO
const countrytoiso = require('country-to-iso');


// Crea una instancia de aplicación de Express en el puerto 3000
const app = express();
const port = 3000;


// Montaje de middleware en la aplicación. Middleware son funciones que tienen acceso al objeto de solicitud (request), al
// objeto de respuesta (res) y a la siguiente función de middleware en el ciclo de solicitud/respuesta de la aplicación.
// En este caso se utiliza el middleware express.static, que permitirá servir los archivos estáticos que se encuentran en
// el directorio "public"
app.use(express.static('public'));


// Configuración de una ruta en la aplicación para que cuando se acceda a la ruta raíz (/) se sirva el archivo "app.html"
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'app.html'));
  });


// Configuración de una ruta en la aplicación para manejar solicitudes GET a la ruta /data_pais/:data_pais. Transforma
// el nombre del país a código ISO, obtiene datos de la API de World Data Bank y devuelve estos datos en formato JSON
app.get('/data_pais/:nombre_pais', async (req, res) => {
  var nombre_pais = req.params.nombre_pais;
  const iso_pais = countrytoiso.countryToAlpha2(nombre_pais)
  console.log(`País solicitado ${nombre_pais} , ${iso_pais}`);
  try {
    const respuesta = await axios.get(`http://api.worldbank.org/v2/country/${iso_pais}?format=json`);
    res.json(respuesta.data);
  } catch (error) {
    res.status(500).send('No se pudo extraer información para este país');
  }
});


// Se inicia el servidor en el puerto especificado. Se imprime un mensaje en la consola con la URL de acceso al servidor
app.listen(port, () => {
  console.log(`Acceso al servidor: http://localhost:${port}`);
});
