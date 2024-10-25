import React from 'react';

interface SearchBarProps {
    SearchHandler: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ SearchHandler }) => {
    return (
        <input 
            type="text" 
            onChange={SearchHandler} 
            placeholder="Search..." 
            className="p-2 border border-gray-300 rounded" 
        />
    );
};

export default SearchBar;
