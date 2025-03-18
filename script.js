/* ===== Lógica de selección de iconos (máximo 2 seleccionados) ===== */
let selectedIcons = [];
const iconElements = document.querySelectorAll('aside .icon');

iconElements.forEach(icon => {
  icon.addEventListener('click', () => {
    if (icon.classList.contains('selected')) {
      icon.classList.remove('selected');
      selectedIcons = selectedIcons.filter(el => el !== icon);
    } else {
      if (selectedIcons.length >= 2) {
        const firstIcon = selectedIcons.shift();
        if (firstIcon) {
          firstIcon.classList.remove('selected');
        }
      }
      icon.classList.add('selected');
      selectedIcons.push(icon);
    }
  });
});

/* ===== Función para inicializar el carrusel ===== */
function initCarousel(carousel) {
  let currentSlide = 0;
  const carouselImages = carousel.querySelector('.carousel-images');
  const imgs = carouselImages.querySelectorAll('.carousel-image');
  const prevButton = carousel.querySelector('.carousel-prev');
  const nextButton = carousel.querySelector('.carousel-next');

  imgs.forEach((img, index) => {
    img.style.opacity = index === 0 ? 1 : 0;
  });

  prevButton.addEventListener('click', function(e) {
    e.stopPropagation();
    imgs[currentSlide].style.opacity = 0;
    currentSlide = (currentSlide - 1 + imgs.length) % imgs.length;
    imgs[currentSlide].style.opacity = 1;
  });

  nextButton.addEventListener('click', function(e) {
    e.stopPropagation();
    imgs[currentSlide].style.opacity = 0;
    currentSlide = (currentSlide + 1) % imgs.length;
    imgs[currentSlide].style.opacity = 1;
  });
}

/* ===== Lógica para el Modal con Flip ===== */
function openModal(card) {
  const modal = document.getElementById('modal');
  const modalContent = modal.querySelector('.modal-content');
  modalContent.innerHTML = ''; // Limpia contenido previo

  // Crear contenedor para el contenido scrollable
  const modalBody = document.createElement('div');
  modalBody.className = "modal-body";

  // Contenedor flip
  const flipContainer = document.createElement('div');
  flipContainer.className = "flip-container";
  const flipCard = document.createElement('div');
  flipCard.className = "flip-card";

  // Cara frontal: clonar la carta original
  const frontSide = document.createElement('div');
  frontSide.className = "flip-card-side flip-card-front";
  const frontClone = card.cloneNode(true);
  frontClone.style.transform = 'none';
  frontSide.appendChild(frontClone);

  // Cara trasera: contenido de detalles
  const backSide = document.createElement('div');
  backSide.className = "flip-card-side flip-card-back";
  // Recuperar datos desde data-attributes
  const weight = parseInt(card.dataset.weight) || 0;
  const weightKg = weight / 10;
  const percentage = Math.min((weightKg / 100) * 100, 100);
  const abilities = JSON.parse(card.dataset.abilities || "[]");
  const types = JSON.parse(card.dataset.types || "[]");

  // Crear efectividad (tabla con iconos)
  const effectivenessTable = document.createElement('table');
  effectivenessTable.className = "type-table";
  const headerRow = document.createElement('tr');
  headerRow.innerHTML = "<th>Gana a</th><th>Pierde contra</th>";
  effectivenessTable.appendChild(headerRow);
  const dataRow = document.createElement('tr');
  const tdWins = document.createElement('td');
  const tdLoses = document.createElement('td');
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
          const iconContainer = document.createElement('div');
          iconContainer.className = `icon ${t}`;
          const img = document.createElement('img');
          img.className = 'type-icon';
          img.src = `img/icons/${t}.svg`;
          img.alt = t;
          iconContainer.appendChild(img);
          tdWins.appendChild(iconContainer);
        });
        
        loses.forEach(t => {
          const iconContainer = document.createElement('div');
          iconContainer.className = `icon ${t}`;
          const img = document.createElement('img');
          img.className = 'type-icon';
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

  // Construir el contenido del backside
  const detailsContainer = document.createElement('div');
  detailsContainer.innerHTML = `<h2 class="text-2xl font-bold mb-2">Detalles</h2>`;
  
  // Peso con barra
  detailsContainer.innerHTML += `<p><strong>Peso:</strong> ${weightKg.toFixed(1)} kg</p>`;
  const weightBarContainer = document.createElement('div');
  weightBarContainer.className = 'weight-bar';
  const weightFill = document.createElement('div');
  weightFill.className = 'weight-fill';
  weightFill.style.width = percentage + '%';
  weightBarContainer.appendChild(weightFill);
  detailsContainer.appendChild(weightBarContainer);
  
  // Lista de habilidades (hasta 3)
  detailsContainer.innerHTML += `<p><strong>Habilidades:</strong></p>`;
  const abilitiesList = document.createElement('ul');
  abilitiesList.className = 'abilities-list';
  abilities.slice(0, 3).forEach(ab => {
    const li = document.createElement('li');
    li.textContent = ab;
    abilitiesList.appendChild(li);
  });
  detailsContainer.appendChild(abilitiesList);
  
  // Efectividad (tabla con iconos)
  detailsContainer.innerHTML += `<p><strong>Efectividad:</strong></p>`;
  detailsContainer.appendChild(effectivenessTable);
  
  backSide.appendChild(detailsContainer);

  // Armar el flip card
  flipCard.appendChild(frontSide);
  flipCard.appendChild(backSide);
  flipContainer.appendChild(flipCard);

  // Agregar flipContainer al modalBody
  modalBody.appendChild(flipContainer);
  modalContent.appendChild(modalBody);

  // Botón de voltear ubicado en la parte inferior (fuera de modalBody para que siempre se vea)
  const flipButton = document.createElement('button');
  flipButton.textContent = "Voltear";
  flipButton.className = "flip-button";
  flipButton.addEventListener('click', function(e) {
    e.stopPropagation();
    flipCard.classList.toggle('flipped');
  });
  modalContent.appendChild(flipButton);

  // Re-inicializar el carrusel si existe en la cara frontal
  const modalCarousel = modalContent.querySelector('.carousel');
  if (modalCarousel && typeof initCarousel === "function") {
    initCarousel(modalCarousel);
  }

  modal.classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
}

// Delegación de evento para abrir modal al hacer clic en una carta
document.getElementById('pokemonGrid').addEventListener('click', function(e) {
  const card = e.target.closest('.pokemon-card');
  if (card) {
    openModal(card);
  }
});

// Cierra el modal si se hace clic fuera del contenido
document.getElementById('modal').addEventListener('click', function(e) {
  if (e.target === this) {
    closeModal();
  }
});

/* ===== Función para alternar visibilidad del sidebar ===== */
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('hidden');
}
