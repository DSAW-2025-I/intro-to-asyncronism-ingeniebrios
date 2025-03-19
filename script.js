/* ===== Funciones de utilidad para el spinner ===== */
function showLoading() {
  const loadingContainer = document.getElementById("loadingContainer");
  if (loadingContainer) {
    loadingContainer.classList.remove("hidden");
  }
}

function hideLoading() {
  const loadingContainer = document.getElementById("loadingContainer");
  if (loadingContainer) {
    loadingContainer.classList.add("hidden");
  }
}

/* ===========================================================
   Funciones para habilitar/deshabilitar el botón "Cargar más"
   =========================================================== */
function disableLoadMore() {
  const loadMoreBtn = document.getElementById("loadMore");
  if (loadMoreBtn) {
    loadMoreBtn.classList.add("hidden");
  }
}

function enableLoadMore() {
  const loadMoreBtn = document.getElementById("loadMore");
  if (loadMoreBtn) {
    loadMoreBtn.classList.remove("hidden");
  }
}

/* ===========================================================
   Lógica para seleccionar iconos de tipo (hasta 2 máximo)
   =========================================================== */
let selectedIcons = []; // Guardamos hasta 2 iconos seleccionados

const iconElements = document.querySelectorAll("aside .icon");
iconElements.forEach(icon => {
  icon.addEventListener("click", () => {
    if (icon.classList.contains("selected")) {
      icon.classList.remove("selected");
      selectedIcons = selectedIcons.filter(el => el !== icon);
    } else {
      if (selectedIcons.length === 2) {
        selectedIcons[0].classList.remove("selected");
        selectedIcons.shift();
      }
      icon.classList.add("selected");
      selectedIcons.push(icon);
    }
  });
});

/* ===========================================================
   Función para inicializar el carrusel
   =========================================================== */
function initCarousel(carousel) {
  let currentSlide = 0;
  const carouselImages = carousel.querySelector(".carousel-images");
  const imgs = carouselImages.querySelectorAll(".carousel-image");
  const prevButton = carousel.querySelector(".carousel-prev");
  const nextButton = carousel.querySelector(".carousel-next");

  imgs.forEach((img, index) => {
    img.style.opacity = index === 0 ? 1 : 0;
  });

  prevButton.addEventListener("click", function(e) {
    e.stopPropagation();
    imgs[currentSlide].style.opacity = 0;
    currentSlide = (currentSlide - 1 + imgs.length) % imgs.length;
    imgs[currentSlide].style.opacity = 1;
  });

  nextButton.addEventListener("click", function(e) {
    e.stopPropagation();
    imgs[currentSlide].style.opacity = 0;
    currentSlide = (currentSlide + 1) % imgs.length;
    imgs[currentSlide].style.opacity = 1;
  });
}

/* ===========================================================
   Lógica para el modal con flip
   =========================================================== */
function openModal(card) {
  const modal = document.getElementById("modal");
  const modalContent = modal.querySelector(".modal-content");
  modalContent.innerHTML = "";

  const modalBody = document.createElement("div");
  modalBody.className = "modal-body";
  const flipContainer = document.createElement("div");
  flipContainer.className = "flip-container";
  const flipCard = document.createElement("div");
  flipCard.className = "flip-card";

  const frontSide = document.createElement("div");
  frontSide.className = "flip-card-side flip-card-front";
  const frontClone = card.cloneNode(true);
  frontClone.style.transform = "none";
  frontSide.appendChild(frontClone);

  const backSide = document.createElement("div");
  backSide.className = "flip-card-side flip-card-back";
  const weight = parseInt(card.dataset.weight) || 0;
  const weightKg = weight / 10;
  const percentage = Math.min((weightKg / 100) * 100, 100);
  const abilities = JSON.parse(card.dataset.abilities || "[]");
  const types = JSON.parse(card.dataset.types || "[]");

  const effectivenessTable = document.createElement("table");
  effectivenessTable.className = "type-table";
  const headerRow = document.createElement("tr");
  headerRow.innerHTML = "<th>Gana a</th><th>Pierde contra</th>";
  effectivenessTable.appendChild(headerRow);
  const dataRow = document.createElement("tr");
  const tdWins = document.createElement("td");
  const tdLoses = document.createElement("td");
  dataRow.appendChild(tdWins);
  dataRow.appendChild(tdLoses);
  effectivenessTable.appendChild(dataRow);

  if (types.length > 0) {
    fetch(`https://pokeapi.co/api/v2/type/${types[0]}`)
      .then(response => response.json())
      .then(data => {
        const wins = data.damage_relations.double_damage_to.map(item => item.name);
        const loses = data.damage_relations.double_damage_from.map(item => item.name);

        wins.forEach(t => {
          const iconContainer = document.createElement("div");
          iconContainer.className = `icon ${t}`;
          const img = document.createElement("img");
          img.className = "type-icon";
          img.src = `img/icons/${t}.svg`;
          img.alt = t;
          iconContainer.appendChild(img);
          tdWins.appendChild(iconContainer);
        });

        loses.forEach(t => {
          const iconContainer = document.createElement("div");
          iconContainer.className = `icon ${t}`;
          const img = document.createElement("img");
          img.className = "type-icon";
          img.src = `img/icons/${t}.svg`;
          img.alt = t;
          iconContainer.appendChild(img);
          tdLoses.appendChild(iconContainer);
        });
      })
      .catch(error => {
        tdWins.textContent = "Error";
        tdLoses.textContent = "Error";
      });
  } else {
    tdWins.textContent = "N/A";
    tdLoses.textContent = "N/A";
  }

  const detailsContainer = document.createElement("div");
  detailsContainer.innerHTML = `<h2 class="text-2xl font-bold mb-2">Detalles</h2>`;
  detailsContainer.innerHTML += `<p><strong>Peso:</strong> ${weightKg.toFixed(1)} kg</p>`;
  const weightBarContainer = document.createElement("div");
  weightBarContainer.className = "weight-bar";
  const weightFill = document.createElement("div");
  weightFill.className = "weight-fill";
  weightFill.style.width = percentage + "%";
  weightBarContainer.appendChild(weightFill);
  detailsContainer.appendChild(weightBarContainer);
  detailsContainer.innerHTML += `<p><strong>Habilidades:</strong></p>`;
  const abilitiesList = document.createElement("ul");
  abilitiesList.className = "abilities-list";
  abilities.slice(0, 3).forEach(ab => {
    const li = document.createElement("li");
    li.textContent = ab;
    abilitiesList.appendChild(li);
  });
  detailsContainer.appendChild(abilitiesList);
  detailsContainer.innerHTML += `<p><strong>Efectividad:</strong></p>`;
  detailsContainer.appendChild(effectivenessTable);
  backSide.appendChild(detailsContainer);

  flipCard.appendChild(frontSide);
  flipCard.appendChild(backSide);
  flipContainer.appendChild(flipCard);
  modalBody.appendChild(flipContainer);
  modalContent.appendChild(modalBody);

  const flipButton = document.createElement("button");
  flipButton.textContent = "Voltear";
  flipButton.className = "flip-button";
  flipButton.addEventListener("click", function(e) {
    e.stopPropagation();
    flipCard.classList.toggle("flipped");
  });
  modalContent.appendChild(flipButton);

  const modalCarousel = modalContent.querySelector(".carousel");
  if (modalCarousel && typeof initCarousel === "function") {
    initCarousel(modalCarousel);
  }

  modal.classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}

// Delegación para abrir el modal al hacer clic en una carta
document.getElementById("pokemonGrid").addEventListener("click", function(e) {
  const card = e.target.closest(".pokemon-card");
  if (card) {
    openModal(card);
  }
});

// Cerrar modal al hacer clic fuera del contenido
document.getElementById("modal").addEventListener("click", function(e) {
  if (e.target === this) {
    closeModal();
  }
});

// Permitir cerrar el modal con la tecla Escape
document.addEventListener("keydown", function(e) {
  if (e.key === "Escape") {
    closeModal();
  }
});

/* ===== Función para alternar la visibilidad del sidebar ===== */
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("hidden");
}

/* ===========================================================
   Búsqueda por nombre / número (inmediata al escribir)
   =========================================================== */
document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("searchInput");
  const sortSelect = document.getElementById("sortSelect");
  const pokemonGrid = document.getElementById("pokemonGrid");

  let previousSearchTerm = "";

  function executeSearch() {
    showLoading();
    pokemonGrid.innerHTML = "";
    const selectedOption = document.querySelector('input[name="searchOption"]:checked').value;
    const term = searchInput.value.trim();

    if (!term) {
      enableLoadMore();
      hideLoading();
      return;
    } else {
      disableLoadMore();
    }

    previousSearchTerm = term;
    let url;
    if (selectedOption === "name") {
      url = `https://pokeapi.co/api/v2/pokemon/${term.toLowerCase()}`;
    } else {
      url = `https://pokeapi.co/api/v2/pokemon/${term}`;
    }

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error("Pokémon no encontrado");
        return res.json();
      })
      .then(poke => {
        createPokemonCard(poke);
        hideLoading();
      })
      .catch(err => {
        console.error(err);
        pokemonGrid.innerHTML = "<div class='text-center text-2xl mt-8'>No se encontró Pokémon</div>";
        hideLoading();
      });
  }

  searchInput.addEventListener("input", executeSearch);
  sortSelect.addEventListener("change", executeSearch);
});

/* ===========================================================
   Función auxiliar para filtrar por estadísticas
   =========================================================== */
function filterByStats(pokemonList) {
  const hpMin = Number(document.getElementById("vidaMin").value);
  const hpMax = Number(document.getElementById("vidaMax").value);
  const atkMin = Number(document.getElementById("ataqueMin").value);
  const atkMax = Number(document.getElementById("ataqueMax").value);
  const defMin = Number(document.getElementById("defensaMin").value);
  const defMax = Number(document.getElementById("defensaMax").value);
  const spaMin = Number(document.getElementById("ataqueEspMin").value);
  const spaMax = Number(document.getElementById("ataqueEspMax").value);
  
  return pokemonList.filter(pokemon => {
    const hp = pokemon.stats.find(s => s.stat.name === "hp")?.base_stat || 0;
    const atk = pokemon.stats.find(s => s.stat.name === "attack")?.base_stat || 0;
    const def = pokemon.stats.find(s => s.stat.name === "defense")?.base_stat || 0;
    const spa = pokemon.stats.find(s => s.stat.name === "special-attack")?.base_stat || 0;
    return (hp >= hpMin && hp <= hpMax &&
            atk >= atkMin && atk <= atkMax &&
            def >= defMin && def <= defMax &&
            spa >= spaMin && spa <= spaMax);
  });
}

/* ===========================================================
   Búsqueda avanzada por tipos y estadísticas
   =========================================================== */
const advancedSearchBtn = document.getElementById("advancedSearchButton");
if (advancedSearchBtn) {
  advancedSearchBtn.addEventListener("click", executeAdvancedSearch);
}

function executeAdvancedSearch() {
  // Cierra el sidebar al ejecutar la búsqueda avanzada
  document.getElementById("sidebar").classList.add("hidden");

  const pokemonGrid = document.getElementById("pokemonGrid");
  showLoading();
  pokemonGrid.innerHTML = "";
  disableLoadMore();

  const selectedTypes = selectedIcons.map(icon => icon.classList[1]);
  if (selectedTypes.length === 0) {
    hideLoading();
    return;
  }

  function fetchTypeData(type) {
    return fetch(`https://pokeapi.co/api/v2/type/${type}`)
      .then(res => res.json())
      .then(data => data.pokemon.map(item => item.pokemon))
      .catch(err => {
        console.error(err);
        return [];
      });
  }

  if (selectedTypes.length === 1) {
    fetchTypeData(selectedTypes[0])
      .then(pokemonEntries => {
        if (pokemonEntries.length === 0) {
          pokemonGrid.innerHTML = "<div class='text-center text-2xl mt-8'>No se encontró Pokémon</div>";
          hideLoading();
          return;
        }
        return Promise.all(pokemonEntries.map(entry =>
          fetch(entry.url).then(res => res.json())
        ));
      })
      .then(pokemonList => {
        if (!pokemonList) return;
        const filteredList = filterByStats(pokemonList);
        if (filteredList.length === 0) {
          pokemonGrid.innerHTML = "<div class='text-center text-2xl mt-8'>No se encontró Pokémon</div>";
        } else {
          filteredList.forEach(p => createPokemonCard(p));
        }
        hideLoading();
      })
      .catch(err => {
        console.error(err);
        pokemonGrid.innerHTML = "<div class='text-center text-2xl mt-8'>No se encontró Pokémon</div>";
        hideLoading();
      });
  } else {
    const [typeA, typeB] = selectedTypes;
    Promise.all([ fetchTypeData(typeA), fetchTypeData(typeB) ])
      .then(([dataA, dataB]) => {
        const setA = new Set(dataA.map(p => p.name));
        const intersectionNames = dataB
          .filter(p => setA.has(p.name))
          .map(p => p.name);
        if (intersectionNames.length === 0) {
          pokemonGrid.innerHTML = "<div class='text-center text-2xl mt-8'>No se encontró Pokémon</div>";
          hideLoading();
          return;
        }
        return Promise.all(intersectionNames.map(name =>
          fetch(`https://pokeapi.co/api/v2/pokemon/${name}`).then(res => res.json())
        ));
      })
      .then(pokemonList => {
        if (!pokemonList) return;
        const filteredList = filterByStats(pokemonList);
        if (filteredList.length === 0) {
          pokemonGrid.innerHTML = "<div class='text-center text-2xl mt-8'>No se encontró Pokémon</div>";
        } else {
          filteredList.forEach(p => createPokemonCard(p));
        }
        hideLoading();
      })
      .catch(err => {
        console.error(err);
        pokemonGrid.innerHTML = "<div class='text-center text-2xl mt-8'>No se encontró Pokémon</div>";
        hideLoading();
      });
  }
}
