import { ListCollapse, Settings2, X } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
interface SearchBarProps {
    SearchHandler: (e: React.ChangeEvent<HTMLInputElement>) => void;
    append?: React.ReactNode;
    prepend?: React.ReactNode;
}

const SearchBar: React.FC<SearchBarProps> = ({ SearchHandler, prepend, append }) => {
    const { t } = useTranslation();
    const expandTables = true;
    return (
        <div className={`flex rounded-lg items-center p-2 gap-2 justify-between ${localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme text-textdarktheme' : 'bg-white text-black'}`}>
            {prepend}
            <div className='flex items-center gap-2'>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 21L16.514 16.506M19 10.5C19 12.7543 18.1045 14.9163 16.5104 16.5104C14.9163 18.1045 12.7543 19 10.5 19C8.24566 19 6.08365 18.1045 4.48959 16.5104C2.89553 14.9163 2 12.7543 2 10.5C2 8.24566 2.89553 6.08365 4.48959 4.48959C6.08365 2.89553 8.24566 2 10.5 2C12.7543 2 14.9163 2.89553 16.5104 4.48959C18.1045 6.08365 19 8.24566 19 10.5Z" stroke={localStorage.getItem('darkMode') === 'true' ? '#e1e1e1' : '#1e1e1e'} strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" />
                </svg>

                <input
                    type="text"
                    onChange={SearchHandler}
                    placeholder={t('reservations.searchPlaceholder')}
                    className=" search"
                />
            </div>
            {append}
        </div>
    );
};

export default SearchBar;
