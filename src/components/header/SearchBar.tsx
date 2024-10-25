import React from 'react';

interface SearchBarProps {
    SearchHandler: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ SearchHandler }) => {
    return (
       <div className='flex items-center justify-normal '>
        
         <input 
            type="text" 
            onChange={SearchHandler} 
            placeholder="Search..." 
            className=" border border-gray-300 rounded" 
        />
       </div>
    );
};

export default SearchBar;
