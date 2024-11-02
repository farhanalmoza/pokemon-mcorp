import { PokemonDetail } from "@/types/pokemon";
import { getPokemonImageUrl } from "@/utils/formatPokemonId";
import axios from "axios";
import { GetServerSideProps } from "next";
import Image from "next/image";
import { useRouter } from "next/router";

interface PokemonDetailPageProps {
  pokemon: PokemonDetail;
}

export default function PokemonDetailPage({ pokemon }: PokemonDetailPageProps) {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => router.push("/")}
        className="mb-6 bg-gray-200 px-4 py-2 rounded"
      >Back to list</button>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="text-center">
          <Image
            src={getPokemonImageUrl(pokemon.id)}
            alt={pokemon.name}
            width={400}
            height={400}
            className="mx-auto"
          />
        </div>

        <div>
          <h1 className="text-4xl font-bold capitalize mb-4">{pokemon.name}</h1>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <strong>Height:</strong> {pokemon.height / 10} m
            </div>
            <div>
              <strong>Weight:</strong> {pokemon.weight / 10} kg
            </div>
            <div>
              <strong>Types:</strong>
              {pokemon.types.map((type) => (
                <span
                  key={type.type.name}
                  className="capitalize mr-2 bg-gray-200 px-2 rounded"
                > 
                  {type.type.name}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4">Stats</h3>
            {pokemon.stats.map((stat) => (
              <div key={stat.stat.name} className="mb-2">
                <div className="flex justify between">
                  <span className="capitalize">{stat.stat.name}</span>
                  <span>{stat.base_stat}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5" style={{ width: `${stat.base_stat / 255 * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4">Abilities</h3>
            <div className="flex flex-wrap gap-2">
              {pokemon.abilities.map((ability) => (
                <span key={ability.ability.name} className="capitalize bg-green-100 px-2 py-1 rounded">
                  {ability.ability.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params || {};

  try {
    const { data } = await axios.get<PokemonDetail>(`https://pokeapi.co/api/v2/pokemon/${id}`);

    return {
      props: {
        pokemon: data,
      },
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
}