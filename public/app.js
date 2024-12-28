const fetchLyrics = async () => {
  const song = document.getElementById('song').value;
  const artist = document.getElementById('artist').value;

  const response = await fetch(`/api/lyrics?song=${song}&artist=${artist}`);
  const data = await response.json();

  const formattedLyrics = data.lyrics
    .split('\n')
    .map(line => line.trim() !== '' ? `<p class="lyric-line">${line}</p>` : '<p class="lyric-line"><br></p>')  // Salto de estrofas
    .join('');

  const resultContainer = document.getElementById('result');
  resultContainer.innerHTML = `<div class="section">${formattedLyrics}</div>`;
  
  // Desplaza hacia arriba el contenedor para mostrar desde el inicio
  resultContainer.scrollTop = 0;
};
