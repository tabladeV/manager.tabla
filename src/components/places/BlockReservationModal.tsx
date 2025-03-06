import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import BaseSelect from '../common/BaseSelect';
import { useList } from '@refinedev/core';
import { useDateContext } from '../../context/DateContext';
import BaseBtn from '../common/BaseBtn';

interface BlockReservationModalProps {
  onClose: () => void;
  onConfirm: (blockData: any) => void;
}

const BlockReservationModal: React.FC<BlockReservationModalProps> = ({
  onClose,
  onConfirm,
}) => {
  const [floors, setFloors] = useState<any>([]);
  const { data, isLoading: isLoadingFloors, error: floorsError } = useList({
    resource: "api/v1/bo/floors/",
    queryOptions: {
      onSuccess(data) {
        setFloors(data?.data as unknown as any[]);
      }
    }
  });
  
  const { chosenDay } = useDateContext();
  
  const { t } = useTranslation();
  const darkMode = localStorage.getItem('darkMode') === 'true';

  // Get current date for default values
  const today = format(chosenDay, 'yyyy-MM-dd');

  // State for form data
  const [currentHour, setCurrentHour] = useState(format(chosenDay, 'HH'));
  const [selectedDate, setSelectedDate] = useState(today);
  const [startBlockTime, setStartBlockTime] = useState<string | null>(format(new Date(), 'HH:00'));
  const [endBlockTime, setEndBlockTime] = useState<string | null>(null);
  const [blockType, setBlockType] = useState<'all' | 'floor' | 'table'>('all');
  const [selectedFloor, setSelectedFloor] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string[]>([]);
  const [blockOnline, setBlockOnline] = useState(true);
  const [blockInHouse, setBlockInHouse] = useState(false);
  const [blockMenus, setBlockMenus] = useState(false);

  const mappedFloors = useCallback(()=>{
    return floors?.map((floor: any) => ({ label: floor.name, value: floor.id })) || [];
  },[floors]);
  
  const filteredTables = useCallback(()=>{
    return floors?.map((floor:any)=> floor.tables.map((table:any)=>({...table, name: `${table.name} (${floor.name})`}))).flat().filter((table:any)=>!selectedFloor.includes(table.floor)).map((table:any)=>({label:table.name, value:table.id})) || [];
  },[floors, selectedFloor]);


  const startBlockHours = useCallback(()=>Array.from({ length: (24 - Number(currentHour)) },(value, index) => Number(currentHour) + index).map((value, i) => {
    const hour = value.toString().padStart(2, '0');
    return (
      { label: `${hour}:00`, value: `${hour}:00` }
    );
  }),[currentHour]);

  const endBlockHours = useCallback(()=>{
    return Array.from({ length: (24 - Number(startBlockTime?.replace(':00','')))},(value, index) => Number(startBlockTime?.replace(':00','')) + index).map((value, i) => {
      const hour = value.toString().padStart(2, '0');
      return (
        { label: `${hour}:59`, value: `${hour}:59` }
      );
    });
  },[startBlockTime]);

  // Dummy data for floors and tables
  const tables = [
    { id: '101', name: 'Table 1', floor: '1' },
    { id: '102', name: 'Table 2', floor: '1' },
    { id: '103', name: 'Table 3', floor: '1' },
    { id: '201', name: 'Table 1', floor: '2' },
    { id: '202', name: 'Table 2', floor: '2' },
    { id: '301', name: 'Table 1', floor: '3' },
  ];

  const handleSubmit = () => {
    const blockData = {
      date: selectedDate,
      start_time: startBlockTime,
      end_time: endBlockTime,
      block_type: blockType,
      floor_id: selectedFloor,
      table_id: selectedTable,
      block_online: blockOnline,
      block_back_office: blockInHouse,
      block_menus: blockMenus
    };

    onConfirm(blockData);
    onClose();
  };

  const isValid = useCallback(
    () => {
      const isAtleastOneOptionSelected = blockOnline || blockInHouse || blockMenus;

      if (!startBlockTime || !endBlockTime) return false;

      if (blockType === 'all') {
        return isAtleastOneOptionSelected;
      }

      if (blockType === 'floor') {
        return selectedFloor.length > 0 && isAtleastOneOptionSelected;
      }

      if (blockType === 'table') {
        return (selectedTable.length > 0 || selectedFloor.length > 0) && isAtleastOneOptionSelected;
      }

      return false;
    }, [
    blockType,
    blockOnline,
    blockInHouse,
    blockMenus,
    selectedFloor.length,
    selectedTable.length,
    startBlockTime,
    endBlockTime
  ])

  return (
    <div>
      {/* Overlay for clicking outside to close */}
      <div className="overlay" onClick={onClose}></div>
      <div className={`sidepopup w-[45%] overflow-y-auto lt-sm:w-full lt-sm:h-[70vh] lt-sm:bottom-0 lt-sm:overflow-y-auto h-full ${localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme text-white' : 'bg-white'}`}>

        {/* Header */}
        <div className="flex justify-between items-center border-gray-200 mb-4">
          <div className="flex items-center">
            <Calendar className="mr-2" size={20} />
            <h2 className="text-2xl font-[600]">Block reservations</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Date selector */}
        <div className="px-1 py-3 border-gray-200">
          <div className="flex items-center space-x-2 text-sm font-medium">
            <Calendar size={16} />
            <span>
              {
                format(new Date(selectedDate), 'EEEE, d MMM yyy')
              }
            </span>
          </div>
        </div>

        {/* Block form */}
        <div className="p-1">
          <h3 className="text-sm font-semibold uppercase text-gray-500 mb-3">
            BLOCK NEW RESERVATIONS
          </h3>

          {/* Time range */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <BaseSelect loading={isLoadingFloors} 
                label='START BLOCK TIME'
                options={startBlockHours()}
                value={startBlockTime}
                error={!startBlockTime}
                hint="This field is required"
                onChange={(val) => {
                  setStartBlockTime(val as string);
                  setEndBlockTime(null);
                }}
              />
            </div>
            <div>
              <BaseSelect loading={isLoadingFloors} 
                label='END BLOCK TIME'
                options={endBlockHours()}
                value={endBlockTime}
                disabled={!startBlockTime}
                onChange={(val) => setEndBlockTime(val as string)}
                error={!endBlockTime}
                hint="This field is required"
              />
            </div>
          </div>

          {/* Block type selection */}
          <div className="mb-4">
            <div className="flex space-x-2 mb-3">
              <button
                type="button"
                onClick={() => setBlockType('all')}
                className={`px-3 py-1.5 text-sm rounded-md ${blockType === 'all'
                    ? 'btn-primary text-white'
                    : darkMode ? 'bg-darkthemeitems' : 'bg-gray-100'
                  }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => {
                  setBlockType('floor');
                  setSelectedFloor([]);
                }}
                className={`px-3 py-1.5 text-sm rounded-md ${blockType === 'floor'
                    ? 'btn-primary text-white'
                    : darkMode ? 'bg-darkthemeitems' : 'bg-gray-100'
                  }`}
              >
                Floor
              </button>
              <button
                type="button"
                onClick={() => {
                  setBlockType('table');
                  setSelectedFloor([]);
                  setSelectedTable([]);
                }}
                className={`px-3 py-1.5 text-sm rounded-md ${blockType === 'table'
                    ? 'btn-primary text-white'
                    : darkMode ? 'bg-darkthemeitems' : 'bg-gray-100'
                  }`}
              >
                Table
              </button>
            </div>

            {/* Conditional floor/table selector */}
            {blockType === 'floor' && (
              <div className="mb-3">
                <BaseSelect loading={isLoadingFloors} 
                    label='SELECT FLOOR'
                    options={mappedFloors()}
                    multiple
                    error={!selectedFloor?.length}
                    hint="This field is required"
                    onChange={(val) => setSelectedFloor(val as string[])}
                    chips={true}
                  />
              </div>
            )}

            {blockType === 'table' && (
              <>
                <div className="mb-3">
                  <BaseSelect loading={isLoadingFloors} 
                    label='SELECT FLOOR'
                    options={mappedFloors()}
                    multiple
                    onChange={(val) => setSelectedFloor(val as string[])}
                    chips={true}
                  />
                </div>

                <div className="mb-3">
                  <BaseSelect loading={isLoadingFloors} 
                    label='SELECT TABLE'
                    options={filteredTables()}
                    multiple
                    onChange={(val) => setSelectedTable(val as string[])}
                    chips={true}
                  />
                </div>
              </>
            )}
          </div>

          {/* Block type checkboxes */}
          <div className="flex space-x-4 mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={blockOnline}
                onChange={() => setBlockOnline(!blockOnline)}
                className="checkbox mr-2 form-checkbox h-4 w-4 text-green-600"
              />
              <span className="text-sm">Online hours</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={blockInHouse}
                onChange={() => setBlockInHouse(!blockInHouse)}
                className="checkbox mr-2 form-checkbox h-4 w-4 text-green-600"
              />
              <span className="text-sm">In-house hours</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={blockMenus}
                onChange={() => setBlockMenus(!blockMenus)}
                className="checkbox mr-2 form-checkbox h-4 w-4 text-green-600"
              />
              <span className="text-sm">Menus</span>
            </label>
          </div>

          {/* Action button */}
          <BaseBtn onClick={handleSubmit} disabled={!isValid()} className='w-full' loading={isLoadingFloors}>
            BLOCK SELECTED HOURS
          </BaseBtn>
        </div>

        {/* Currently blocked section */}
        <div className="p-4 border-t border-gray-200 mt-4">
          <h3 className="text-sm font-semibold uppercase text-gray-500 mb-3">
            CURRENTLY BLOCKED RESERVATIONS
          </h3>

          {/* Empty state or list would go here */}
          <div className="text-sm text-gray-500 text-center py-4">
            No blocked reservations for this date
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockReservationModal;