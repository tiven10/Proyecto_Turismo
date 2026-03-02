/**
 * app.js
 * Proyecto: Mi PokéDex
 *
 * Feature 2 – Consumo de la API Pokémon        (Arturo)
 * Feature 3 – Manejo y procesamiento de datos  (Martín)
 * Feature 5 – Renderizado final                (Thomas)
 */


// ─────────────────────────────────────────────────────────────
// Feature 2 – Consumo de la API Pokémon (Arturo)
// ─────────────────────────────────────────────────────────────

const POKEMON_API_BASE = 'https://pokeapi.co/api/v2';
const POKEMON_LIMIT = 10;

async function getPokemon() {
  const listResponse = await fetch(
    `${POKEMON_API_BASE}/pokemon?limit=${POKEMON_LIMIT}&offset=0`
  );
  if (!listResponse.ok) {
    throw new Error(`Error al conectar con la API: ${listResponse.status} ${listResponse.statusText}`);
  }
  const listData = await listResponse.json();
  const pokemonUrls = listData.results;

  const detailPromises = pokemonUrls.map(pokemon =>
    fetch(pokemon.url).then(res => {
      if (!res.ok) throw new Error(`No se pudo obtener ${pokemon.name}`);
      return res.json();
    })
  );
  const detailsArray = await Promise.all(detailPromises);

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

function procesarPokemon(lista) {
  return lista.map(pokemon => ({
    ...pokemon,
    name: pokemon.name.toUpperCase(),
    tipoPrincipal: pokemon.types[0],
    poderTotal:
      pokemon.stats.HP +
      pokemon.stats.ATK +
      pokemon.stats.DEF +
      pokemon.stats.SPD
  }));
}


// ─────────────────────────────────────────────────────────────
// Feature 5 – Renderizado final (Thomas)
// ─────────────────────────────────────────────────────────────

// Crea una card del DOM igual a como la diseñó Eilin, pero con datos reales
function buildCardHTML(pokemon) {
  // Columna contenedora
  const col = document.createElement('div');
  col.className = 'col-12 col-sm-6 col-md-4 col-lg-3';

  // Card
  const card = document.createElement('div');
  card.className = 'card pokemon-card h-100 shadow-sm';

  // Sección imagen (igual que Eilin)
  const imgBg = document.createElement('div');
  imgBg.className = 'img-bg text-center';

  const img = document.createElement('img');
  img.src = pokemon.image;
  img.className = 'card-img-top w-75';
  img.alt = pokemon.name;

  imgBg.appendChild(img);

  // Sección body (igual que Eilin)
  const cardBody = document.createElement('div');
  cardBody.className = 'card-body text-center';

  const title = document.createElement('h5');
  title.className = 'card-title';
  title.textContent = pokemon.name;

  const badge = document.createElement('span');
  badge.className = 'badge bg-secondary';
  badge.textContent = pokemon.tipoPrincipal;

  cardBody.appendChild(title);
  cardBody.appendChild(badge);

  // Armar todo
  card.appendChild(imgBg);
  card.appendChild(cardBody);
  col.appendChild(card);

  return col;
}

// Función principal: une todo y renderiza las cards en el HTML
async function init() {
  const container = document.getElementById('pokemon-container');

  try {
    // 1. Traer datos (Arturo)
    const pokemons = await getPokemon();

    // 2. Procesar datos (Martín)
    const procesados = procesarPokemon(pokemons);
    console.log("Pokémon procesados:", procesados);

    // 3. Crear e insertar cada card en el contenedor (Eilin + Thomas)
    procesados.forEach(pokemon => {
      const card = buildCardHTML(pokemon);
      container.appendChild(card);
    });

    console.log(`✅ ${procesados.length} cards renderizadas correctamente.`);

  } catch (error) {
    console.error("Error en la aplicación:", error);
  }
}

// Arrancar cuando el HTML esté listo
document.addEventListener('DOMContentLoaded', init);