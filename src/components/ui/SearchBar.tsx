// Reusable search input component

import React from 'react';
import { SearchIcon } from '../icons';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = "search...",
  autoFocus = true
}) => {
  return (
    <div className="mb-8">
      <div className="group flex items-center border border-gray-200 px-3 py-2.5 focus-within:border-gray-400 transition-colors">
        <SearchIcon />
        <input
          type="text"
          onChange={(e) => onSearch(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent border-none ml-2.5 text-sm focus:outline-none placeholder-gray-400 text-black"
          autoFocus={autoFocus}
        />
      </div>
    </div>
  );
};
