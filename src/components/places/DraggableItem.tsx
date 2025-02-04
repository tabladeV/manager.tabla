// DraggableItem.tsx
import { BaseKey } from '@refinedev/core';
import { useDrag } from 'react-dnd';
import { useTranslation } from 'react-i18next';


interface tablesType {
  id: BaseKey;
  name: string;
}
interface DraggableItemProps {
  itemData: { id: BaseKey; full_name: string; time: string; date: string; status: "PENDING" | "CONFIRMED" | "CANCELED";number_of_guests: number; occasion?: string ; created_at: string; tables: tablesType[] }; 
}

const ItemType = 'BOX';

const DraggableItem = (props:DraggableItemProps) => {
  const {t} = useTranslation();
 // Data to pass on drop
  const { itemData } = props;
  const [, drag] = useDrag(() => ({
    type: ItemType,
    item: { id: itemData.id }, // This is the data being passed
    canDrag: true,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={` cursor-grab p-3 flex justify-between rounded-[10px] mb-3 ${localStorage.getItem('darkMode')=== 'true'? 'bg-bgdarktheme2 text-[#e2e2e290]':' bg-softgreytheme text-subblack'}`}
    >
      <div className='flex items-center'>
        <div className={`w-[5vw]  flex  flex-col text-center items-center ${localStorage.getItem('darkMode')==='true'?'text-[#e2e2e290]':''}`}>
          <h3 className='font-[700] text-[17px]'>{itemData.time}</h3>
          <p className='font-[600] text-[12px]'>{itemData.date}</p>
        </div>
        <div className='border border-[#00000010] mx-2 border-solid h-full'></div>
        <div>
          <h3 className={` font-[600] ${localStorage.getItem('darkMode')==='true'?'text-whitetheme':'text-blacktheme'}`}>
            {itemData.full_name}
          </h3>
          <div className='flex gap-3'>

            <div className='flex gap-1 items-center'>
              <svg width="16" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.66658 7.08334V7.91667H0.833252V7.08334C0.833252 7.08334 0.833252 5.41667 3.74992 5.41667C6.66658 5.41667 6.66658 7.08334 6.66658 7.08334ZM5.20825 3.12501C5.20825 2.83657 5.12272 2.55462 4.96248 2.3148C4.80223 2.07498 4.57447 1.88806 4.308 1.77768C4.04152 1.6673 3.7483 1.63842 3.46541 1.69469C3.18252 1.75096 2.92267 1.88986 2.71872 2.09381C2.51477 2.29776 2.37588 2.55761 2.31961 2.8405C2.26334 3.12339 2.29222 3.41661 2.40259 3.68308C2.51297 3.94956 2.69989 4.17732 2.93971 4.33756C3.17953 4.49781 3.46149 4.58334 3.74992 4.58334C4.13669 4.58334 4.50763 4.42969 4.78112 4.1562C5.05461 3.88271 5.20825 3.51178 5.20825 3.12501ZM6.64158 5.41667C6.89773 5.6149 7.10732 5.86685 7.25562 6.1548C7.40391 6.44275 7.4873 6.75969 7.49992 7.08334V7.91667H9.16658V7.08334C9.16658 7.08334 9.16658 5.57084 6.64158 5.41667ZM6.24992 1.66667C5.96316 1.66534 5.68275 1.75106 5.44575 1.91251C5.69885 2.26615 5.83494 2.69012 5.83494 3.12501C5.83494 3.55989 5.69885 3.98386 5.44575 4.33751C5.68275 4.49895 5.96316 4.58467 6.24992 4.58334C6.63669 4.58334 7.00763 4.42969 7.28112 4.1562C7.55461 3.88271 7.70825 3.51178 7.70825 3.12501C7.70825 2.73823 7.55461 2.3673 7.28112 2.09381C7.00763 1.82032 6.63669 1.66667 6.24992 1.66667Z" fill={localStorage.getItem('darkMode')==='true'?'#e1e1e1':'#1e1e1e'} fill-opacity="0.5"/>
              </svg>
              <p className='font-[600] text-[13px] flex flex-row  w-[5em]'>{itemData.number_of_guests} {t('placeManagement.reservations.guests')}</p>
            </div>
            
            <div className='flex gap-1 items-center'>
              <svg width="16" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.5625 6.4375L6.01042 4.98958C6.09375 4.90625 6.19444 4.86458 6.3125 4.86458C6.43056 4.86458 6.53125 4.90625 6.61458 4.98958C6.69792 5.07291 6.73958 5.17361 6.73958 5.29166C6.73958 5.40972 6.69792 5.51041 6.61458 5.59375L4.85417 7.35416C4.77083 7.4375 4.67361 7.47916 4.5625 7.47916C4.45139 7.47916 4.35417 7.4375 4.27083 7.35416L3.38542 6.46875C3.30208 6.38541 3.26042 6.28472 3.26042 6.16666C3.26042 6.04861 3.30208 5.94791 3.38542 5.86458C3.46875 5.78125 3.56944 5.73958 3.6875 5.73958C3.80556 5.73958 3.90625 5.78125 3.98958 5.86458L4.5625 6.4375ZM2.08333 9.16666C1.85417 9.16666 1.65806 9.08514 1.495 8.92208C1.33194 8.75902 1.25028 8.56277 1.25 8.33333V2.5C1.25 2.27083 1.33167 2.07472 1.495 1.91166C1.65833 1.74861 1.85444 1.66694 2.08333 1.66666H2.5V1.25C2.5 1.13194 2.54 1.03305 2.62 0.95333C2.7 0.873608 2.79889 0.833607 2.91667 0.83333C3.03444 0.833052 3.13347 0.873052 3.21375 0.95333C3.29403 1.03361 3.33389 1.1325 3.33333 1.25V1.66666H6.66667V1.25C6.66667 1.13194 6.70667 1.03305 6.78667 0.95333C6.86667 0.873608 6.96556 0.833607 7.08333 0.83333C7.20111 0.833052 7.30014 0.873052 7.38042 0.95333C7.46069 1.03361 7.50056 1.1325 7.5 1.25V1.66666H7.91667C8.14583 1.66666 8.34208 1.74833 8.50542 1.91166C8.66875 2.075 8.75028 2.27111 8.75 2.5V8.33333C8.75 8.5625 8.66847 8.75875 8.50542 8.92208C8.34236 9.08541 8.14611 9.16694 7.91667 9.16666H2.08333ZM2.08333 8.33333H7.91667V4.16666H2.08333V8.33333Z" fill={localStorage.getItem('darkMode')==='true'?'#e1e1e1':'#1e1e1e'} fill-opacity="0.5"/>
              </svg>
              <p className='font-[600] text-[13px]'>{itemData.occasion === "none" ? t('placeManagement.reservations.none'):itemData.occasion}</p>
            </div>

          </div>
        </div>
      </div>
      <button >
        <svg width="24" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.84615 3H2.23077C1.90435 3 1.5913 3.12967 1.36048 3.36048C1.12967 3.5913 1 3.90435 1 4.23077V9.76923C1 10.0957 1.12967 10.4087 1.36048 10.6395C1.5913 10.8703 1.90435 11 2.23077 11H7.76923C8.09565 11 8.4087 10.8703 8.63952 10.6395C8.87033 10.4087 9 10.0957 9 9.76923V9.15385" stroke="#88AB61" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M8.0833 2.16672L9.83328 3.9167M10.6412 3.09129C10.8709 2.86155 11 2.54996 11 2.22505C11 1.90015 10.8709 1.58855 10.6412 1.35881C10.4114 1.12907 10.0999 1 9.77495 1C9.45004 1 9.13845 1.12907 8.90871 1.35881L4 6.25002V8H5.74998L10.6412 3.09129Z" stroke="#88AB61" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>

      </button>
      
      
    </div>
  );
};

export default DraggableItem;
