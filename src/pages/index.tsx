import { Pokemon, PokemonResponse } from '@/types/pokemon';
import { getPokemonImageUrl } from '@/utils/formatPokemonId';
import { Inter } from 'next/font/google'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { GetServerSideProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Search } from '@/components/Search';
import { ChevronUp, ChevronDown } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] })

interface PokemonPageProps {
  initialPokemonData: PokemonResponse 
}

export default function PokemonPage({ initialPokemonData }: PokemonPageProps) {
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

  const fetchPokemonPage = async (page: number) => {
    setIsLoading(true);
    try {
      const offset = (page - 1) * 20;
      const { data } = await axios.get<PokemonResponse>(
        `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=20`
      );

      const pokemonWihDetails = data.results.map((pokemon, index) => ({
        ...pokemon,
        id: offset + index + 1,
        imageUrl: getPokemonImageUrl(offset + index + 1)
      }));

      setPokemonList(pokemonWihDetails);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching pokemon data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const renderPagination = () => {
    const pages = [];
    const maxPagesToShow = 5;
    const halfMax = Math.floor(maxPagesToShow / 2);

    let startPage = Math.max(1, currentPage - halfMax);
    let endPage = Math.min(totalPages, currentPage + halfMax);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => fetchPokemonPage(i)}
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
          onClick={() => fetchPokemonPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2 py-1 text-sm mx-1 rounded-lg bg-[#fff] text-black md:text-base md:px-4 md:py-2"
        >Prev</button>
        {pages}
        <button
          onClick={() => fetchPokemonPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-2 py-1 text-sm mx-1 rounded-lg bg-[#fff] text-black md:text-base md:px-4 md:py-2"
        >Next</button>
      </div>
    )
  }

  const [searchResults, setSearchResults] = useState<Pokemon[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [originalList, setOriginalList] = useState<Pokemon[]>([]);

  useEffect(() => {
    setOriginalList(pokemonList);
  }, [pokemonList]);

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    setIsLoading(true);

    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      setPokemonList(originalList);
      setIsLoading(false);
      return;
    }

    try {
      const normalizedQuery = query.toLowerCase();
      const { data } = await axios.get<PokemonResponse>(
        `https://pokeapi.co/api/v2/pokemon?limit=1000`
      );

      const filteredResults = data.results
        .filter((pokemon) =>
          pokemon.name.toLowerCase().includes(normalizedQuery)
        )
        .map((pokemon, index) => {
          const id = parseInt(pokemon.url.split('/').filter(Boolean).pop() || '0');
          return {
            ...pokemon,
            id,
            imageUrl: getPokemonImageUrl(id)
          };
        })
        .slice(0, 20);
      
      setSearchResults(filteredResults);
      setPokemonList(filteredResults);
    } catch (error) {
      console.error('Error fetching search results:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }

  const clearSearch = () => {
    setIsSearching(false);
    setSearchResults([]);
    setPokemonList(originalList);
  }

  return (
    <div className="pt-5 pb-20 px-6 md:px-10 lg:px-36">
      {/* Header */}
      <h1 className='text-center text-4xl font-bold'>Pokemon Corp</h1>

      {/* Search Bar & Sorting */}
      <div className='md:flex justify-center gap-2 pt-5 md:mb-3'>
        <Search onSearch={handleSearch} />
        {/* <div className='flex justify-center gap-2 w-full'>
          <select name="sort" id="sort" className='bg-[#fff] rounded-lg w-full px-4 py-2'>
            <option value="name">Name</option>
            <option value="id">ID</option>
          </select>
          <div className="flex gap-2">
            <button className='sort-active py-1 px-3 rounded-lg'>Asc</button>
            <button className='sort-inactive py-1 px-3 rounded-lg'>Desc</button>
          </div>
        </div> */}
      </div>

      {isSearching && (
        <div className="text-center mb-4">
          <button
            onClick={clearSearch}
            className='text-blue-500 hover:text-blue-700 underline'
          >Clear Search</button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center">Loading...</div>
      ) : (
        <>
          {searchResults.length === 0 && isSearching ? (
            <div className="text-center text-gray-600">
              No pokemon found matching your search.
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
                    <button className='bg-blue-500 text-white py-2 px-4 rounded-lg w-full mt-5'>Detal</button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!isSearching && renderPagination()}
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const { data } = await axios.get<PokemonResponse>(
      `https://pokeapi.co/api/v2/pokemon?offset=0&limit=20`
    )

    return {
      props: {
        initialPokemonData: data
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
        }
      }
    };
  }
}
