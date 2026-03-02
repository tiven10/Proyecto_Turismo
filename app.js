/**
 * app.js
 * Proyecto: Mi PokéDex
 *
 * Estructura:
 *   - Feature 2 – Consumo de la API Pokémon        (Arturo)
 *   - Feature 3 – Manejo y procesamiento de datos  (Martín)
 *   - Feature 5 – Renderizado final                (Thomas)
 */

// ─────────────────────────────────────────────────────────────
// Feature 2 – Consumo de la API Pokémon (Arturo)
// ─────────────────────────────────────────────────────────────

const POKEMON_API_BASE = 'https://pokeapi.co/api/v2';
const POKEMON_LIMIT = 10;

/**
 * Obtiene exactamente 10 Pokémon desde la PokéAPI.
 * @returns {Promise<Array>} Lista de objetos Pokémon con detalles.
 */
async function getPokemon() {
  // 1. Obtener la lista de los primeros 10 Pokémon
  const listResponse = await fetch(
    `${POKEMON_API_BASE}/pokemon?limit=${POKEMON_LIMIT}&offset=0`
  );

  if (!listResponse.ok) {
    throw new Error(`Error al conectar con la API: ${listResponse.status} ${listResponse.statusText}`);
  }

  const listData = await listResponse.json();
  const pokemonUrls = listData.results; // Array de { name, url }

  // 2. Obtener detalles de cada Pokémon en paralelo
  const detailPromises = pokemonUrls.map(pokemon =>
    fetch(pokemon.url).then(res => {
      if (!res.ok) throw new Error(`No se pudo obtener ${pokemon.name}`);
      return res.json();
    })
  );

  const detailsArray = await Promise.all(detailPromises);

  // 3. Mapear a un objeto limpio y útil
  const pokemonList = detailsArray.map(detail => ({
    id:    detail.id,
    name:  detail.name,
    image: detail.sprites.other['official-artwork'].front_default
           || detail.sprites.front_default,
    types: detail.types.map(t => t.type.name),
    stats: {
      HP:  detail.stats[0].base_stat,
      ATK: detail.stats[1].base_stat,
      DEF: detail.stats[2].base_stat,
      SPD: detail.stats[5].base_stat,
    },
    height: detail.height,
    weight: detail.weight,
  }));

  console.log(`✅ ${pokemonList.length} Pokémon obtenidos:`, pokemonList);
  return pokemonList;
}


// ─────────────────────────────────────────────────────────────
// Feature 3 – Manejo y procesamiento de datos (Martín)
// ─────────────────────────────────────────────────────────────

// Mapeo de tipos en inglés → español y color de badge Bootstrap
const TYPE_CONFIG = {
  normal:   { label: 'Normal',     badge: 'bg-secondary'          },
  fire:     { label: 'Fuego',      badge: 'bg-danger'             },
  water:    { label: 'Agua',       badge: 'bg-primary'            },
  grass:    { label: 'Planta',     badge: 'bg-success'            },
  electric: { label: 'Eléctrico',  badge: 'bg-warning text-dark'  },
  ice:      { label: 'Hielo',      badge: 'bg-info text-dark'     },
  fighting: { label: 'Lucha',      badge: 'bg-danger'             },
  poison:   { label: 'Veneno',     badge: 'bg-purple text-white'  },
  ground:   { label: 'Tierra',     badge: 'bg-warning text-dark'  },
  flying:   { label: 'Volador',    badge: 'bg-info text-dark'     },
  psychic:  { label: 'Psíquico',   badge: 'bg-pink text-white'    },
  bug:      { label: 'Bicho',      badge: 'bg-success'            },
  rock:     { label: 'Roca',       badge: 'bg-secondary'          },
  ghost:    { label: 'Fantasma',   badge: 'bg-dark text-white'    },
  dragon:   { label: 'Dragón',     badge: 'bg-primary'            },
  dark:     { label: 'Siniestro',  badge: 'bg-dark text-white'    },
  steel:    { label: 'Acero',      badge: 'bg-secondary'          },
  fairy:    { label: 'Hada',       badge: 'bg-pink text-white'    },
};

/**
 * Recibe un objeto pokémon y retorna el HTML completo de una card Bootstrap.
 * @param {Object} pokemon - Objeto con id, name, image, types, stats, height, weight
 * @returns {string} HTML de la card lista para insertar en el DOM
 */
function buildCardHTML(pokemon) {
  // Generar los badges de tipo
  const badges = pokemon.types.map(type => {
    const config = TYPE_CONFIG[type] || { label: type, badge: 'bg-secondary' };
    return `<span class="badge ${config.badge} me-1">${config.label}</span>`;
  }).join('');

  // Formatear número de pokémon con ceros: 1 → #001
  const formattedId = `#${String(pokemon.id).padStart(3, '0')}`;

  // Convertir altura y peso a unidades legibles
  const heightM  = (pokemon.height / 10).toFixed(1);  // decímetros → metros
  const weightKg = (pokemon.weight / 10).toFixed(1);  // hectogramos → kg

  return `
    <div class="col-12 col-sm-6 col-md-4 col-lg-3">
      <div class="card pokemon-card h-100 shadow-sm">

        <div class="img-bg text-center">
          <img
            src="${pokemon.image}"
            class="card-img-top w-75"
            alt="${pokemon.name}"
          >
        </div>

        <div class="card-body text-center">
          <p class="text-muted mb-1 small">${formattedId}</p>
          <h5 class="card-title">${pokemon.name}</h5>
          <div class="mb-3">${badges}</div>

          <div class="d-flex justify-content-around text-muted small mb-2">
            <span>📏 ${heightM} m</span>
            <span>⚖️ ${weightKg} kg</span>
          </div>

          <hr class="my-2">

          <div class="d-flex justify-content-around small fw-bold">
            <span title="HP">❤️ ${pokemon.stats.HP}</span>
            <span title="Ataque">⚔️ ${pokemon.stats.ATK}</span>
            <span title="Defensa">🛡️ ${pokemon.stats.DEF}</span>
            <span title="Velocidad">💨 ${pokemon.stats.SPD}</span>
          </div>
        </div>

      </div>
    </div>
  `;
}


// ─────────────────────────────────────────────────────────────
// Feature 5 – Renderizado final (Thomas)
// ─────────────────────────────────────────────────────────────

/**
 * Función principal: trae los pokémon, construye las cards y las renderiza
 * en el contenedor #pokemon-container del HTML.
 */
async function renderPokemon() {
  const container = document.getElementById('pokemon-container');

  // Mostrar spinner de carga mientras llega la data
  container.innerHTML = `
    <div class="col-12 text-center py-5">
      <div class="spinner-border text-danger" role="status" style="width: 3rem; height: 3rem;"></div>
      <p class="mt-3 text-muted">Cargando Pokémon...</p>
    </div>
  `;

  try {
    // 1. Traer los datos desde la API (Feature 2 - Arturo)
    const pokemonList = await getPokemon();

    // 2. Construir el HTML de cada card (Feature 3 - Martín)
    const cardsHTML = pokemonList.map(pokemon => buildCardHTML(pokemon)).join('');

    // 3. Insertar todas las cards en el contenedor del HTML (Feature 4 - Eilin)
    container.innerHTML = cardsHTML;

    console.log(`✅ ${pokemonList.length} cards renderizadas correctamente.`);

  } catch (error) {
    // Mostrar mensaje de error si algo falla
    container.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger text-center" role="alert">
          ❌ Error al cargar los Pokémon: ${error.message}
        </div>
      </div>
    `;
    console.error('Error en renderPokemon:', error);
  }
}

// Ejecutar renderPokemon() cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', renderPokemon);
