import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Calendar, Trash2 } from 'lucide-react';
import { format, set } from 'date-fns';
import BaseSelect from '../common/BaseSelect';
import { useCreate, useList, useDelete } from '@refinedev/core';
import { useDateContext } from '../../context/DateContext';
import BaseBtn from '../common/BaseBtn';
import ActionPopup from '../popup/ActionPopup';
import IntervalCalendar from '../Calendar/IntervalCalendar';
import BaseTimeInput from '../common/BaseTimeInput';

interface BlockReservationModalProps {
  onClose: () => void;
  onConfirm?: (blockData: any) => void;
}

const BlockReservationModal: React.FC<BlockReservationModalProps> = ({
  onClose,
  onConfirm,
}) => {
  const [floors, setFloors] = useState<any>([]);
  const [blockedReservations, setBlockedReservations] = useState<any>([]);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [targetRule, setTargetRule] = useState<any>(null);
  
  const {mutate: createReservationPause, isLoading: loadingCreate} = useCreate({
    errorNotification(error, values, resource) {
      return {
        type: 'error',
        message: error?.formattedMessage,
      };
    },
  });
  const {mutate: deleteReservationPause, isLoading: loadingDelete} = useDelete();
  

  const { data, isLoading: isLoadingFloors, error: floorsError } = useList({
    resource: "api/v1/bo/floors/",
    queryOptions: {
      onSuccess(data) {
        setFloors(data?.data as unknown as any[]);
      }
    },
    errorNotification(error, values, resource) {
      return {
        type: 'error',
        message: error?.formattedMessage,
      };
    },
  });
  
  const { data: reservationPauses, isLoading: loadingReservationPauses, error: reservationPausesError, refetch: refetchReservationPauses } = useList({
    resource: "api/v1/bo/reservations/pauses/",
    queryOptions: {
      onSuccess(data) {
        setBlockedReservations(data?.data as unknown as any[]);
      }
    },
    errorNotification(error, values, resource) {
      return {
        type: 'error',
        message: error?.formattedMessage,
      };
    },
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
  const [blockType, setBlockType] = useState<'ALL' | 'FLOOR'>('ALL');
  const [selectedFloor, setSelectedFloor] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string[]>([]);
  const [blockOnline, setBlockOnline] = useState(true);
  const [blockInHouse, setBlockInHouse] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<{ start: Date | null, end: Date | null }>({ start: new Date(today), end: null });
  const [focusedDate, setFocusedDate] = useState<boolean>(false);
  const [periodType, setPeriodType] = useState<"DATE"|"TIME">('TIME');
  
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
    const formatedStartDate = format(new Date(selectedDateRange?.start as Date), 'yyyy-MM-dd');
    const formatedEndDate = format(new Date(selectedDateRange?.end as Date), 'yyyy-MM-dd');

    const blockData = {
      start_date: formatedStartDate,
      end_date: selectedDateRange?.end? formatedEndDate: formatedStartDate,
      start_time: startBlockTime,
      end_time: endBlockTime,
      block_type: blockType,
      floors: selectedFloor,
      tables: selectedTable,
      block_online: blockOnline,
      block_backoffice: blockInHouse,
      peroid_type: periodType,
    };

    createReservationPause({
          resource: `api/v1/bo/reservations/pauses/`,
          values: {
            restaurant: localStorage.getItem('restaurant_id'),
            ...blockData
          }
        }, {
          onSuccess(data, variables, context) {
              console.log(data)
          },
          onError(error, variables, context) {
            console.log(error)
          },
        });
    onConfirm?.(blockData);
    onClose();
  };

  const handleDeleteBlock = (id: string) => {
    deleteReservationPause({
      resource: `api/v1/bo/reservations/pauses`,
      id: id+'/',
    }, {
      onSuccess: () => {
        refetchReservationPauses();
        setShowConfirmPopup(false);
        setTargetRule(null);
      },
      onError: (error) => {
        console.error("Failed to delete reservation block:", error);
      }
    });
  };

  const isValid = useCallback(
    () => {
      const isAtleastOneOptionSelected = blockOnline || blockInHouse;
      if(periodType === 'TIME')
        if (!startBlockTime || !endBlockTime) return false;

      if (blockType === 'ALL') {
        return isAtleastOneOptionSelected;
      }

      if (blockType === 'FLOOR') {
        return (selectedTable?.length || selectedFloor?.length) && isAtleastOneOptionSelected;
      }

      return false;
    }, [
    blockType,
    blockOnline,
    blockInHouse,
    selectedFloor.length,
    selectedTable.length,
    startBlockTime,
    endBlockTime,
    periodType
  ])

  // Helper to get block type label
  const getBlockTypeLabel = (block: any) => {
    if (block.block_type === 'ALL') return 'All tables';
    if (block.block_type === 'FLOOR') return `Floor${block.floor_id?.length > 1 ? 's' : ''}`;
    if (block.block_type === 'TABLE') return `Table${block.table_id?.length > 1 ? 's' : ''}`;
    return block.block_type;
  };

  // Helper to get reservation channel
  const getReservationChannel = (block: any) => {
    if (block.block_online && block.block_backoffice) return 'Online & Back-Office';
    if (block.block_online) return 'Online only';
    if (block.block_backoffice) return 'Back-Office only';
    return '';
  };

  const handleDateClick = (range: { start: Date, end: Date }): void => {
    setSelectedDateRange(range);
  };
  
  
  const formatedStartDate = () => {
    return format(new Date(selectedDateRange?.start || ''), 'EEEE, d MMM yyy')
  };
  
  const formatedEndDate = () => {
    return format(new Date(selectedDateRange?.end || ''), 'EEEE, d MMM yyy')
  };

  // DateSelectionModal Component
  interface DateSelectionModalProps {
    focusedDate: boolean;
    setFocusedDate: (focused: boolean) => void;
    handleDateClick: (range: { start: Date, end: Date }) => void;
  }
  
  const DateSelectionModal: React.FC<DateSelectionModalProps> = ({ 
    focusedDate, 
    setFocusedDate, 
    handleDateClick 
  }) => {
    if (!focusedDate) return null;
    
    return (
      <div>
        <div className="overlay" onClick={() => setFocusedDate(false)}></div>
        <div className={`popup p-4 lt-sm:w-full lt-sm:h-[70vh] lt-sm:bottom-0 dark:bg-bgdarktheme bg-white`}>
          <IntervalCalendar onClose={()=>setFocusedDate(false)} onRangeSelect={handleDateClick} />
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Overlay for clicking outside to close */}
      <div className="overlay" onClick={onClose}></div>
      <ActionPopup
        action={'delete'}
        secondAction={() => setShowConfirmPopup(false)}
        secondActionText={'Cancel'}
        message={showConfirmPopup &&
          <>
            <h6>Are you sure you want to Delete this blocking rule?</h6>
            <div
              key={targetRule?.id}
              className={`w-full p-2 rounded-md text-sm ${darkMode ? 'bg-darkthemeitems' : 'bg-gray-50'} flex justify-between items-center`}
            >
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="font-medium">
                    {targetRule?.start_date}
                  </span>
                  {(targetRule?.end_date && targetRule?.end_date !== targetRule?.start_date) &&
                    <span className="font-medium">
                      - {targetRule?.start_date}
                    </span>
                  }
                  <span className={`text-xs px-2 py-0.5 rounded-full ${targetRule?.block_online && targetRule?.block_backoffice
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {getReservationChannel(targetRule)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">
                    {targetRule?.start_time?.replace(':00', '')} - {targetRule?.end_time?.replace(':00', '')}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {targetRule?.block_type === 'FLOOR' && (
                    <>
                      {targetRule?.floors?.length > 0 && (<span>Floors: {targetRule?.floors.map((el: { name: string }) => el.name).join(', ')}</span>)}
                      <br />
                      {targetRule?.tables?.length > 0 && (
                        <span>Tables: {targetRule?.tables.map((el: { name: string }) => el.name).join(', ')}</span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        }
        actionFunction={() => handleDeleteBlock(targetRule?.id)}
        showPopup={showConfirmPopup}
        setShowPopup={setShowConfirmPopup}
      />
      <div className={`sidepopup w-[45%] overflow-y-auto lt-sm:w-full lt-sm:h-[70vh] lt-sm:bottom-0 lt-sm:overflow-y-auto h-full dark:bg-bgdarktheme dark:text-white bg-white`}>

        {/* Header */}
        <div className="flex justify-between items-center border-gray-200">
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
        <div className="py-3 border-gray-200">
          <div className='flex flex-wrap items-center justify-between'>
            {selectedDateRange?.start && <div className="flex items-center space-x-2 text-sm font-medium">
              {selectedDateRange?.end && formatedStartDate() !== formatedEndDate() && <span>From</span>}
              <Calendar size={16} />
              <span>
                {
                  formatedStartDate()
                }
              </span>
            </div>}            
            {selectedDateRange?.end && (formatedStartDate() !== formatedEndDate()) && <>
            <div className="flex items-center space-x-2 text-sm font-medium">
            <span> To </span>
              <Calendar size={16} />
              <span>
                {
                  formatedEndDate()
                }
              </span>
            </div>
                </>
            }
          </div>
          <button
            onClick={() => setFocusedDate(true)}
            className="btn-primary my-1 py-1"
          >
            Change date
          </button>
        </div>

        {/* Block form */}
        <div className="p-1">
          <h3 className="text-sm font-semibold uppercase text-gray-500 mb-3">
            BLOCK NEW RESERVATIONS
          </h3>

          {/* Time range */}
          <div className="flex space-x-2 mb-3">
            <button
              type="button"
              onClick={() => {
                setPeriodType('TIME');
              }}
              className={`px-3 py-1.5 text-sm rounded-md ${periodType === 'TIME'
                ? 'btn-primary text-white'
                : darkMode ? 'bg-darkthemeitems' : 'bg-gray-100'
                }`}
            >
              Time
            </button>
            <button
              type="button"
              onClick={() => {
                setPeriodType('DATE');
              }}
              className={`px-3 py-1.5 text-sm rounded-md ${periodType === 'DATE'
                ? 'btn-primary text-white'
                : darkMode ? 'bg-darkthemeitems' : 'bg-gray-100'
                }`}
            >
              Date / Date Range
            </button>
          </div>
          { periodType === 'TIME'?(
            <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <BaseTimeInput loading={isLoadingFloors} 
                label='START BLOCK TIME'
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
              <BaseTimeInput loading={isLoadingFloors} 
                label='END BLOCK TIME'
                value={endBlockTime}
                disabled={!startBlockTime}
                min={startBlockTime}
                onChange={(val) => setEndBlockTime(val as string)}
                error={!endBlockTime}
                hint="This field is required"
              />
            </div>
          </div>
          ):''}

          {/* Block type selection */}
          <div className="mb-4">
            <div className="flex space-x-2 mb-3">
              <button
                type="button"
                onClick={() => setBlockType('ALL')}
                className={`px-3 py-1.5 text-sm rounded-md ${blockType === 'ALL'
                    ? 'btn-primary text-white'
                    : darkMode ? 'bg-darkthemeitems' : 'bg-gray-100'
                  }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => {
                  setBlockType('FLOOR');
                  setSelectedFloor([]);
                }}
                className={`px-3 py-1.5 text-sm rounded-md ${blockType === 'FLOOR'
                    ? 'btn-primary text-white'
                    : darkMode ? 'bg-darkthemeitems' : 'bg-gray-100'
                  }`}
              >
                Floor
              </button>
            </div>

            {blockType === 'FLOOR' && (
              <>
                <div className="mb-3">
                  <BaseSelect loading={isLoadingFloors} 
                    label='SELECT FLOOR'
                    options={mappedFloors()}
                    multiple
                    searchable={true}
                    value={selectedFloor}
                    onChange={(val) => {
                      setSelectedFloor(val as string[]);
                      setSelectedTable([])
                    }}
                    chips={true}
                  />
                </div>

                <div className="mb-3">
                  <BaseSelect loading={isLoadingFloors} 
                    label='SELECT TABLE'
                    options={filteredTables()}
                    multiple
                    searchable={true}
                    value={selectedTable}
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
              <span className="text-sm">Online</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={blockInHouse}
                onChange={() => setBlockInHouse(!blockInHouse)}
                className="checkbox mr-2 form-checkbox h-4 w-4 text-green-600"
              />
              <span className="text-sm">Back office</span>
            </label>
          </div>

          {/* Action button */}
          <BaseBtn onClick={handleSubmit} disabled={!isValid()} className='w-full' loading={isLoadingFloors || loadingCreate}>
            BLOCK SELECTED HOURS
          </BaseBtn>
        </div>

        {/* Currently blocked section */}
        <div className="border-t border-gray-200 mt-4">
          <h3 className="text-sm font-semibold uppercase text-gray-500 mb-3">
            CURRENTLY BLOCKED RESERVATIONS
          </h3>

          {/* Blocked reservations list */}
          {loadingReservationPauses ? (
            <div className="text-sm text-center py-4">Loading...</div>
          ) : !blockedReservations?.results?.length ? (
            <div className="text-sm text-gray-500 text-center py-4">
              No blocked reservations for this date
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto bg-[#F6F6F6] dark:bg-bgdarktheme2 p-2">
              {blockedReservations?.results.map((block: any) => (
                <div 
                  key={block.id} 
                  className={`p-2 rounded-md text-sm ${darkMode ? 'bg-darkthemeitems' : 'bg-gray-50'} flex justify-between items-center`}
                >
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                      <span className="font-medium">
                        {block.start_date}
                      </span>
                      {(block.end_date && block.end_date !== block.start_date) &&
                        <span className="font-medium">
                         <strong>{' To '}</strong> {block.end_date}
                      </span>
                      }
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        block.block_online && block.block_backoffice 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {getReservationChannel(block)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">
                        {block.start_time?.replace(':00','')} - {block.end_time?.replace(':00','')}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {block.block_type === 'FLOOR' && (
                        <>
                          {block.floors?.length > 0 && (<span>Floors: {block.floors.map((el:  {name: string})=>el.name).join(', ')}</span>)}
                          <br/>
                          {block.tables?.length > 0 && (
                            <span>Tables: {block.tables.map((el: {name: string})=>el.name).join(', ')}</span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setTargetRule(block);
                      setShowConfirmPopup(true);
                    }}
                    disabled={loadingDelete}
                    className="ml-2 p-1.5 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Date Selection Modal */}
      <DateSelectionModal
        focusedDate={focusedDate}
        setFocusedDate={setFocusedDate}
        handleDateClick={handleDateClick}
      />
    </div>
  );
};

export default BlockReservationModal;
