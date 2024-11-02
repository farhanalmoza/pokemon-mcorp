export interface Pokemon {
  name: string
  url: string
  id: number
  imageUrl: string
}

export interface PokemonResponse {
  count: number
  next: string
  previous: string
  results: Array<{
    name: string
    url: string
  }>
}

export interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: Array<{
    type: {
      name: string;
    }
  }>;
  stats: Array<{
    base_stat: number;
    stat: {
      name: string;
    }
  }>;
  abilities: Array<{
    ability: {
      name: string;
    }
  }>;
}