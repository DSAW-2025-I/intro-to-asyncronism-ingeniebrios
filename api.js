let offset = 0;
const limit = 20;

// Mapeo de tipos a clases para el color de las cartas
const typeColors = {
  normal: 'bg-gray-500',
  fire: 'bg-red-500',
  water: 'bg-blue-500',
  grass: 'bg-green-500',
  electric: 'bg-yellow-500',
  ice: 'bg-blue-300',
  fighting: 'bg-red-700',
  poison: 'bg-purple-500',
  ground: 'bg-yellow-700',
  flying: 'bg-indigo-300',
  psychic: 'bg-pink-500',
  bug: 'bg-green-700',
  rock: 'bg-gray-700',
  ghost: 'bg-indigo-700',
  dragon: 'bg-indigo-900',
  dark: 'bg-gray-800',
  steel: 'bg-blue-gray-500',
  fairy: 'bg-pink-300'
};

function loadPokemon() {
  fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`)
      .then(response => response.json())
      .then(data => {
          let pokemonPromises = data.results.map(pokemon =>
              fetch(pokemon.url).then(response => response.json())
          );

          Promise.all(pokemonPromises)
              .then(pokemonList => {
                  // Ordenar Pokémon por su ID antes de cargarlos
                  pokemonList.sort((a, b) => a.id - b.id);
                  
                  // Mostrar las tarjetas en orden numérico
                  pokemonList.forEach(pokemon => createPokemonCard(pokemon));
              });
          
          offset += limit;
      })
      .catch(error => console.error('Error al obtener los Pokémon:', error));
}


function createPokemonCard(pokemon) {
  const name = pokemon.name;
  const id = pokemon.id;
  const sprites = pokemon.sprites;
  const mainImage = sprites.other?.['official-artwork']?.front_default || sprites.front_default;
  const types = pokemon.types.map(t => t.type.name);
  const headerColor = typeColors[types[0]] || 'bg-gray-500';
  const hp = pokemon.stats.find(stat => stat.stat.name === 'hp')?.base_stat || '-';
  const attack = pokemon.stats.find(stat => stat.stat.name === 'attack')?.base_stat || '-';
  const defense = pokemon.stats.find(stat => stat.stat.name === 'defense')?.base_stat || '-';
  const specialAttack = pokemon.stats.find(stat => stat.stat.name === 'special-attack')?.base_stat || '-';

  const card = document.createElement('div');
  card.className = "pokemon-card bg-white shadow-md rounded-lg overflow-hidden mb-4 min-w-[250px]";

  // Almacenar información para el modal en data-attributes
  card.dataset.weight = pokemon.weight; // peso en hectogramos
  card.dataset.abilities = JSON.stringify(pokemon.abilities.map(a => a.ability.name));
  card.dataset.types = JSON.stringify(types);

  // Header de la carta
  const header = document.createElement('div');
  header.className = `${headerColor} text-white px-4 py-2 flex justify-between items-center`;
  header.innerHTML = `<span class="font-bold capitalize">${types.join(', ')}</span><span class="text-sm">#${id.toString().padStart(3, '0')}</span>`;
  
  // Contenedor del contenido
  const content = document.createElement('div');
  content.className = "p-4";
  
  // Título
  const title = document.createElement('h2');
  title.className = "text-xl font-bold mb-2 capitalize";
  title.textContent = name;
  content.appendChild(title);
  
  /* ===== Creación del Carrusel ===== */
  const images = [];
  if (sprites.front_default) images.push({ url: sprites.front_default, label: "Front" });
  if (sprites.back_default) images.push({ url: sprites.back_default, label: "Back" });
  if (sprites.front_shiny) images.push({ url: sprites.front_shiny, label: "Front Shiny" });
  if (sprites.back_shiny) images.push({ url: sprites.back_shiny, label: "Back Shiny" });
  
  if (images.length) {
    const carousel = document.createElement('div');
    carousel.className = "carousel";
    
    const carouselImages = document.createElement('div');
    carouselImages.className = "carousel-images";
    
    images.forEach((imgObj, index) => {
      const imgElement = document.createElement('img');
      imgElement.src = imgObj.url;
      imgElement.alt = `${name} ${imgObj.label}`;
      imgElement.className = "carousel-image";
      imgElement.style.opacity = index === 0 ? 1 : 0;
      carouselImages.appendChild(imgElement);
    });
    
    carousel.appendChild(carouselImages);
    
    const prevButton = document.createElement('button');
    prevButton.className = "carousel-prev";
    prevButton.innerHTML = "&lt;";
    carousel.appendChild(prevButton);
    
    const nextButton = document.createElement('button');
    nextButton.className = "carousel-next";
    nextButton.innerHTML = "&gt;";
    carousel.appendChild(nextButton);
    
    content.appendChild(carousel);
    
    if (typeof initCarousel === "function") {
      initCarousel(carousel);
    }
  } else {
    const img = document.createElement('img');
    img.src = mainImage;
    img.alt = name;
    img.className = "w-full h-40 object-contain mb-4";
    content.appendChild(img);
  }
  
  // Contenedor de estadísticas (opcional en la carta)
  const statsContainer = document.createElement('div');
  statsContainer.className = "grid grid-cols-2 gap-2";
  statsContainer.innerHTML = `
    <div class="bg-gray-100 p-2 rounded text-center">
      <p class="text-sm">Vida</p>
      <p class="font-bold">${hp}</p>
    </div>
    <div class="bg-gray-100 p-2 rounded text-center">
      <p class="text-sm">Ataque</p>
      <p class="font-bold">${attack}</p>
    </div>
    <div class="bg-gray-100 p-2 rounded text-center">
      <p class="text-sm">Defensa</p>
      <p class="font-bold">${defense}</p>
    </div>
    <div class="bg-gray-100 p-2 rounded text-center">
      <p class="text-sm">Ataque Esp.</p>
      <p class="font-bold">${specialAttack}</p>
    </div>
  `;
  content.appendChild(statsContainer);
  
  card.appendChild(header);
  card.appendChild(content);
  document.getElementById('pokemonGrid').appendChild(card);
}

document.getElementById('loadMore').addEventListener('click', loadPokemon);

// Carga inicial de Pokémon
loadPokemon();
