let offset = 0;
const limit = 20;

// Paleta de colores actualizada para mayor contraste y accesibilidad
const typeColors = {
  normal: 'bg-gray-600',
  fire: 'bg-red-600',
  water: 'bg-blue-600',
  grass: 'bg-green-600',
  electric: 'bg-yellow-600',
  ice: 'bg-cyan-500',
  fighting: 'bg-orange-700',
  poison: 'bg-purple-600',
  ground: 'bg-amber-800',
  flying: 'bg-indigo-500',
  psychic: 'bg-pink-600',
  bug: 'bg-lime-600',
  rock: 'bg-amber-700',
  ghost: 'bg-indigo-900',
  dragon: 'bg-violet-700',
  dark: 'bg-gray-800',
  steel: 'bg-blue-800',
  fairy: 'bg-pink-500'
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
                  // Ordenamos por ID para mostrarlos en orden numérico
                  pokemonList.sort((a, b) => a.id - b.id);
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
  const headerColor = typeColors[types[0]] || 'bg-gray-600';
  const hp = pokemon.stats.find(stat => stat.stat.name === 'hp')?.base_stat || '-';
  const attack = pokemon.stats.find(stat => stat.stat.name === 'attack')?.base_stat || '-';
  const defense = pokemon.stats.find(stat => stat.stat.name === 'defense')?.base_stat || '-';
  const specialAttack = pokemon.stats.find(stat => stat.stat.name === 'special-attack')?.base_stat || '-';

  // Se usa min-w-[200px] en móvil y min-w-[250px] en pantallas mayores
  const card = document.createElement('div');
  card.className = "pokemon-card bg-white shadow-md rounded-lg overflow-hidden mb-4 min-w-[200px] sm:min-w-[250px]";
  card.dataset.weight = pokemon.weight;
  card.dataset.abilities = JSON.stringify(pokemon.abilities.map(a => a.ability.name));
  card.dataset.types = JSON.stringify(types);

  const header = document.createElement('div');
  header.className = `${headerColor} text-white px-4 py-2 flex justify-between items-center`;
  header.innerHTML = `<span class="font-bold capitalize">${types.join(', ')}</span><span class="text-sm">#${id.toString().padStart(3, '0')}</span>`;
  
  const content = document.createElement('div');
  content.className = "p-4";
  
  const title = document.createElement('h2');
  title.className = "text-xl font-bold mb-2 capitalize";
  title.textContent = name;
  content.appendChild(title);
  
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
loadPokemon();
