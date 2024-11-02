import { Pokemon, PokemonResponse } from '@/types/pokemon';
import { getPokemonImageUrl } from '@/utils/formatPokemonId';
import { Inter } from 'next/font/google'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { GetServerSideProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] })

interface PokemonPageProps {
  initialPokemonData: PokemonResponse
  allPokemon: Pokemon[]
}

export default function PokemonPage({ initialPokemonData, allPokemon }: PokemonPageProps) {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>(
    initialPokemonData.results.map((pokemon, index) => ({
      ...pokemon,
      id: initialPokemonData.results.indexOf(pokemon) + 1,
      imageUrl: getPokemonImageUrl(index + 1)
    }))
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(
    Math.ceil(initialPokemonData.count / 20)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPokemon, setFilteredPokemon] = useState<Pokemon[]>([]);

  const itemsPerPage = 20;

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredPokemon(allPokemon);
      setTotalPages(Math.ceil(allPokemon.length / itemsPerPage));
      const initialPokemon = allPokemon.slice(0, itemsPerPage);
      setPokemonList(initialPokemon);
      setCurrentPage(1);
      return;
    }

    const searchResults = allPokemon.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pokemon.id.toString() === searchTerm
    );

    setFilteredPokemon(searchResults);
    setTotalPages(Math.ceil(searchResults.length / itemsPerPage));
    const initialSearchResults = searchResults.slice(0, itemsPerPage);
    setPokemonList(initialSearchResults);
    setCurrentPage(1);
  }, [searchTerm, allPokemon]);

  const handlePageChange = (page: number) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedResults = filteredPokemon.slice(startIndex, endIndex);
    setPokemonList(paginatedResults);
    setCurrentPage(page);
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  const SearchBar = () => {
    return (
      <div className="mt-8">
        <div className="max-w-md mx-auto">
          <div className="relative flex items-center">
            <input type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              placeholder="Search"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 text-gray-500 hover:text-gray-700"
              >x</button>
            )}
          </div>
          <p className="text-gray-500 text-sm mt-2 text-center">
            {filteredPokemon.length} pokemon found
          </p>
        </div>
      </div>
    )
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxPagesToShow = 5;
    const halfMax = Math.floor(maxPagesToShow / 2);

    let startPage = Math.max(1, currentPage - halfMax);
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-2 py-1 text-sm mx-1 rounded-lg md:text-base md:px-4 md:py-2 ${
            i === currentPage
              ? 'bg-blue-500 text-white'
              : 'bg-[#fff] text-black'
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex justify-center items-center mt-8 space-x-1 md:space-x-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2 py-1 text-sm mx-1 rounded-lg bg-[#fff] text-black md:text-base md:px-4 md:py-2"
        >Prev</button>
        {pages}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-2 py-1 text-sm mx-1 rounded-lg bg-[#fff] text-black md:text-base md:px-4 md:py-2"
        >Next</button>
      </div>
    )
  }

  return (
    <div className="pt-5 pb-20 px-6 md:px-10 lg:px-36">
      {/* Header */}
      <h1 className='text-center text-4xl font-bold'>Pokemon Corp</h1>

      {/* Search Bar & Sorting */}
      <SearchBar />

      {isLoading ? (
        <div className="flex justify-center items-center">Loading...</div>
      ) : pokemonList.length === 0 ? (
        <div className="text-center text-xl">
          No pokemon found for {searchTerm}
        </div>
      ) : (
        <div className='gap-5 grid grid-cols-2 pt-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-10'>
          {pokemonList.map((pokemon) => (
            <div key={pokemon.id} className='bg-[#fff] p-4 rounded-lg'>
              <Image
                src={pokemon.imageUrl}
                alt={pokemon.name}
                width={200}
                height={200}
                className='rounded-lg items-center'
                onError={(e) => {
                  const imgElement = e.target as HTMLImageElement;
                  imgElement.src = '/images/pokemon-placeholder.png';
                }}
              />
              <h2 className='capitalize text-xl font-bold md:text-lg'>{pokemon.name}</h2>
              <Link href={`/pokemon/${pokemon.id}`}>
                <button className='bg-blue-500 text-white py-2 px-4 rounded-lg w-full mt-5'>Detail</button>
              </Link>
            </div>
          ))}
        </div>
      )}

      {renderPagination()}
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const { data } = await axios.get<PokemonResponse>(
      `https://pokeapi.co/api/v2/pokemon?limit=10000`
    )

    const allPokemon = data.results.map((pokemon, index) => ({
      ...pokemon,
      id: index + 1,
      imageUrl: getPokemonImageUrl(index + 1)
    }))

    const initialData = {
      ...data,
      results: data.results.slice(0, 20)
    }

    return {
      props: {
        initialPokemonData: initialData,
        allPokemon
      }
    }
  } catch (error) {
    console.error('Error fetching initial pokemon data:', error);
    return {
      props: {
        initialPokemonData: {
          count: 0,
          next: null,
          previous: null,
          results: []
        },
        allPokemon: []
      }
    };
  }
}
