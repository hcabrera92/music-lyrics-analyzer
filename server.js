// server.js - Backend con Express para analizar letras de canciones

// 1. Importamos los módulos necesarios
const express = require('express');  // Importa express para crear el servidor
const axios = require('axios');       // Importa axios para hacer solicitudes HTTP
require('dotenv').config();           // Carga variables de entorno desde .env

// 2. Iniciamos la aplicación Express y definimos el puerto
const app = express();                // Inicia la aplicación Express
const PORT = 3000;                    // Define el puerto donde correrá el servidor

// 3. Hacemos que Express sirva archivos estáticos desde la carpeta 'public'
app.use(express.static('public'));    // Sirve archivos estáticos (HTML, CSS, JS)

// 4. Definimos el endpoint para obtener letras de canciones desde la API de Genius
app.get('/api/lyrics', async (req, res) => {
  const { song, artist } = req.query;  // Extrae el nombre de la canción y el artista desde la URL
  const geniusToken = process.env.GENIUS_API_KEY;  // Carga la API Key de Genius desde .env
  console.log('Token de Genius:', geniusToken);

  try {
    // 5. Hacemos una solicitud a la API de Genius con la canción y el artista
    const response = await axios.get(`https://api.genius.com/search?q=${song} ${artist}`, {
      headers: { Authorization: `Bearer ${geniusToken}` }
    });

    // 6. Buscamos la ruta de la primera canción encontrada
    const songPath = response.data.response.hits[0]?.result?.path;
    if (songPath) {
      // Accedemos a la página de Genius para obtener la letra
      const lyricsPage = await axios.get(`https://genius.com${songPath}`);
      
      // Extraemos solo el contenido de las secciones con la letra exacta
      const rawLyrics = lyricsPage.data.match(/<div[^>]*data-lyrics-container="true"[^>]*>(.*?)<\/div>/gs)
      ?.map(p => decodeHtmlEntities(p.replace(/<p>/g, '\n').replace(/<\/p>/g, '\n').replace(/<br>/g, '\n')))
      .join('') || "Letra no encontrada";
  
      res.json({ lyrics: rawLyrics });
    } else {
      res.json({ lyrics: 'No se encontraron letras.' });
    }
  } catch (error) {
    console.error('Error al obtener la letra:', error.message);
    res.status(500).json({ error: 'Error al obtener la letra' });
  }
});

// Función para decodificar entidades HTML
const decodeHtmlEntities = (str) => {
  return str.replace(/&#(\d+);/g, (match, dec) => {
    return String.fromCharCode(dec);
  }).replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
};

// 11. Iniciamos el servidor Express para escuchar solicitudes
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
