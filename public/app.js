const fetchLyrics = async () => {
  const song = document.getElementById('song').value;
  const artist = document.getElementById('artist').value;

  const response = await fetch(`/api/lyrics?song=${song}&artist=${artist}`);
  const data = await response.json();

  document.getElementById('result').innerHTML = data.lyrics || 'No se encontraron letras.';

  // Si se encuentra la letra, envíala a OpenAI para analizar
  if (data.lyrics) {
    analyzeLyrics(data.lyrics);
  }
};

const analyzeLyrics = async (lyrics) => {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ lyrics })
  });

  const data = await response.json();
  document.getElementById('analysis').innerHTML = `<strong>Análisis:</strong><br>${data.analysis || 'Error al analizar la letra.'}`;
};
