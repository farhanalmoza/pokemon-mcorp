export function formatPokemonId(id: number): string {
    return id.toString().padStart(3, '0');
}

export function getPokemonImageUrl(id: number): string {
    return `https://assets.pokemon.com/assets/cms2/img/pokedex/detail/${formatPokemonId(id)}.png`;
}