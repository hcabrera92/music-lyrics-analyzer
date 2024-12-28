// server.js - Backend con Express para analizar letras de canciones

// 1. Importamos los módulos necesarios
const express = require('express');
const axios = require('axios');
const { OpenAI } = require('openai');  // Importa directamente OpenAI
require('dotenv').config();  // Carga variables de entorno desde .env

// 2. Configuramos OpenAI con la API Key desde .env
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY  // Asegúrate de que esta clave esté en tu archivo .env
});

// 3. Iniciamos la aplicación Express y definimos el puerto
const app = express();
const PORT = 3000;

// 4. Hacemos que Express sirva archivos estáticos desde la carpeta 'public'
app.use(express.static('public'));

// 5. Endpoint para obtener letras de canciones desde la API de Genius
app.get('/api/lyrics', async (req, res) => {
  const { song, artist } = req.query;
  const geniusToken = process.env.GENIUS_API_KEY;
  console.log('Token de Genius:', geniusToken);

  try {
    const response = await axios.get(`https://api.genius.com/search?q=${song} ${artist}`, {
      headers: { Authorization: `Bearer ${geniusToken}` }
    });

    const songPath = response.data.response.hits[0]?.result?.path;
    if (songPath) {
      const lyricsPage = await axios.get(`https://genius.com${songPath}`);
      
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

// 6. Endpoint para analizar letras con OpenAI
app.post('/api/analyze', express.json(), async (req, res) => {
  const { lyrics } = req.body;

  try {
    const prompt = `Analiza la siguiente letra de canción y describe su significado, emociones y temas principales:\n\n${lyrics}`;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500
    });

    const analysis = completion.choices[0].message.content;
    res.json({ analysis });
  } catch (error) {
    console.error('Error al analizar la letra:', error.message);
    res.status(500).json({ error: 'Error al analizar la letra' });
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

// 7. Iniciamos el servidor Express
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
