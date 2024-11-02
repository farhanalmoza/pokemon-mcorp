import React, { useState } from "react";

interface SearchProps {
  onSearch: (query: string) => void;
}

export const Search = ({onSearch}: SearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchTerm)
  };

  return (
    <form onSubmit={handleSubmit} className="mb-3 w-full md:mb-0">
      <div className="flex gap-2 max-w-md mx-auto">
        <input type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search"
          className="bg-[#fff] border rounded-lg w-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg">Search</button>
      </div>
    </form>
  )
}