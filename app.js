/**
 * pokemonService.js
 * Feature 2 – Consumo de la API Pokémon
 *
 * Función principal: getPokemon()
 * Conecta con la PokéAPI y obtiene exactamente 10 Pokémon
 * con sus detalles completos (imagen, tipos, stats).
 */

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
