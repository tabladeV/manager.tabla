import React from 'react';
import { usePreview } from 'react-dnd-preview';
import { Users, CalendarCheck } from 'lucide-react';
import { getTextColor } from '../../utils/helpers';
import { useTranslation } from 'react-i18next';
import { useDarkContext } from '../../context/DarkContext';

interface Item {
  width?: number;
  height?: number;
  occasion?: { color?: string; name?: string };
  type?: string;
  full_name?: string;
  number_of_guests?: number;
  time?: string;
  date?: string;
}

const DndPreview = () => {
  const { t } = useTranslation();
  const preview = usePreview();
  const { darkMode } = useDarkContext();
  
  if (!preview.display) {
    return null;
  }
  
  const { itemType, style } = preview;
  const item = preview.item as Item;
  
  // Style for the preview container
  const previewStyle = {
    ...style,
    pointerEvents: 'none',
    zIndex: 1000,
    opacity: 0.8,
    position: 'fixed',
    boxShadow: '0 5px 15px rgba(0,0,0,0.15)',
  };
  
  // Based on the item type, render different preview
  if (itemType === 'TABLE_RESERVATION') {
    // Preview for table reservation
    return (
      <div
        style={previewStyle as React.CSSProperties}
        className={`text-center text-white rounded-[10px] flex flex-col justify-center items-center`}
      >
        <div
          className="flex flex-col justify-center items-center w-full h-full"
          style={{
            width: item.width || 80,
            height: item.height || 80,
            backgroundColor: item.occasion?.color || '#FF4B4B',
            borderRadius: item.type === 'RECTANGLE' ? '10px' : '50%',
            color: getTextColor(item.occasion?.color || '#FF4B4B'),
          }}
        >
          <div className="text-[14px] font-semibold truncate w-full px-2 text-center">
            {item.full_name || 'Guest'}
          </div>
          {item.number_of_guests && (
            <div className="text-[12px] font-semibold">
              {item.number_of_guests} {t('placeManagement.reservations.guests')}
            </div>
          )}
        </div>
      </div>
    );
  } else if (itemType === 'BOX') {
    // Preview for draggable item from sidebar
    return (
      <div
        style={previewStyle as React.CSSProperties}
        className={`p-3 rounded-[10px] ${darkMode ? 'bg-bgdarktheme2 text-whitetheme' : 'bg-softgreytheme text-subblack'}`}
      >
        <div className="flex items-center">
          <div className={`flex flex-col text-center items-center`}>
            <h4 className="font-[700] text-[17px]">{item.time?.replace(':00', '')}</h4>
            <p className="font-[600] text-[12px]">{item.date}</p>
          </div>
          <div className="border border-[#00000010] mx-2 border-solid h-full"></div>
          <div>
            <h3 className={`font-[600] ${darkMode ? 'text-whitetheme' : 'text-blacktheme'}`}>
              {item.full_name}
            </h3>
            <div className="flex gap-3">
              <div className="flex gap-1 items-center">
                <Users size={14} />
                <p className="font-[600] text-[13px]">
                  {item.number_of_guests} {t('placeManagement.reservations.guests')}
                </p>
              </div>
              <div className="flex gap-1 items-center">
                <CalendarCheck size={16} />
                <p className="font-[600] text-[13px]">
                  {!item.occasion ? t('placeManagement.reservations.none') : item.occasion?.name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Default fallback preview
  return (
    <div style={previewStyle as React.CSSProperties} className="bg-white p-2 rounded-md border border-gray-300">
      {item.full_name || 'Dragging...'}
    </div>
  );
};

export default DndPreview;