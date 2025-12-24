import React from 'react';
import BaseBtn from './common/BaseBtn';
import SlideGroup from './common/SlideGroup';
import { FileText } from 'lucide-react';

interface Menu {
  id: string;
  name: string;
  status: 'active' | 'archived';
  file: string | null;
}

// Dummy Data (Updated to match API structure)
const initialMenus: Menu[] = [
  {
    id: '1',
    name: 'Todays menu',
    status: 'active',
    file: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
  {
    id: '2',
    name: 'Chef Menu',
    status: 'active',
    file: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
];

const MenuSelector: React.FC<{ menus?: Menu[] }> = ({ menus }) => {
  const handleMenuClick = (path: string | null) => {
    if (path) {
      window.open(path, '_blank');
    }
  };

  const displayMenus = menus?.length ? menus : initialMenus;

  return (
    <div className="w-full pt-2">
      <SlideGroup align="center">
        {displayMenus.filter(menu => menu.file).map((menu) => (
          <div key={menu.id}>
             <BaseBtn 
                variant="outlined"
                onClick={() => handleMenuClick(menu.file)}
                className="whitespace-nowrap rounded-md min-w-[200px]"
             >
                <span className='text-[#88AB61] flex items-center gap-1'>
                <FileText size={16} />
                {menu.name?.length > 15 ? `${menu.name.substring(0, 12)}...` : menu.name}
                </span>
             </BaseBtn>
          </div>
        ))}
      </SlideGroup>
    </div>
  );
};

export default MenuSelector;
