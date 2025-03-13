import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { BaseKey, useList } from "@refinedev/core";
import BaseSelect from "../common/BaseSelect";
import { ReservationSource, ReservationStatus } from "../common/types/Reservation";
import { TableType as OriginalTableType } from "../../_root/pages/PlacesPage";

interface TableType extends OriginalTableType {
  id: number;
}
import { Occasion, OccasionsType } from "../settings/Occasions";
import { Reservation } from "../../_root/pages/ReservationsPage";

// Types and Interfaces
interface ReceivedTables {
  id: number;
  name: string;
}

interface DataTypes {
  reserveDate: string;
  time: string;
  guests: number;
}

interface EditReservationModalProps {
  showModal: boolean;
  reservation: Reservation | null;
  setShowModal: (show: boolean) => void;
  setShowProcess: (show: boolean) => void;
  reservationProgressData: DataTypes;
  statusHandler: (status: ReservationStatus) => void;
  upDateHandler: (reservation: Reservation) => void;
  hasTable: boolean;
  setHasTable: (hasTable: boolean) => void;
  isDarkMode: boolean;
}

const EditReservationModal = ({
  showModal,
  reservation,
  setShowModal,
  setShowProcess,
  reservationProgressData,
  statusHandler,
  upDateHandler,
  hasTable,
  setHasTable,
  isDarkMode
}: EditReservationModalProps) => {
  const { t } = useTranslation();
  const [availableTables, setAvailableTables] = useState<TableType[]>([]);
  const [selectedTables, setSelectedTables] = useState<number[]>([]);
  const [selectedClient, setSelectedClient] = useState<Reservation | null>(null);
  const [selectedOccasion, setSelectedOccasion] = useState<number | null>(null);

  const [occasions, setOccasions] = useState<Occasion[]>([])
  const [occasionsAPIInfo, setOccasionsAPIInfo] = useState<OccasionsType>()

  const { isLoading: loadingOccasions, error: occasionsError } = useList({
    resource: 'api/v1/bo/occasions/', // Placeholder API endpoint
    queryOptions: {
      onSuccess(data) {
        setOccasionsAPIInfo(data.data as unknown as OccasionsType)
      }
    }
  })

  
  useEffect(() => {
    if (occasionsAPIInfo) {
      setOccasions(occasionsAPIInfo.results as Occasion[] || occasionsAPIInfo || [])
    }
  }, [occasionsAPIInfo])
  // Fetch available tables
  const { data: availableTablesData, isLoading: isLoadingTables } = useList({
    resource: "api/v1/bo/tables/available_tables/",
    filters: [
      { field: "date", operator: "eq", value: selectedClient ? reservationProgressData.reserveDate : '' },
      { field: "number_of_guests", operator: "eq", value: selectedClient ? reservationProgressData.guests : 0 },
      { field: "time", operator: "eq", value: selectedClient ? reservationProgressData.time + ':00' : '' }
    ],
    queryOptions: {
      enabled: !!selectedClient && showModal,
      keepPreviousData: false,
    },
  });

  // Update available tables when data changes
  useEffect(() => {
    if (availableTablesData?.data) {
      setAvailableTables(availableTablesData.data as TableType[]);
      setAvailableTables((prev)=>[...prev, ...(selectedClient?.tables || []) as TableType[]])
    }
  }, [availableTablesData]);
  
  useEffect(()=>{
    setSelectedClient(reservation);
    setSelectedOccasion(reservation?.occasion?.id as number);
    setSelectedTables(reservation?.tables?.map(t=>t.id) as number[])
  },[])
  
  if (!showModal || !selectedClient) return null;

  
  return (
    <div>
      <div className="overlay z-[100]" onClick={() => setShowModal(false)}></div>
      <div className={`sidepopup w-[40%] overflow-y-auto lt-sm:w-full lt-sm:h-[70vh] lt-sm:bottom-0 lt-sm:overflow-y-auto h-full ${isDarkMode ? 'bg-bgdarktheme text-white' : 'bg-white'} `}>
        <h1 className="text-2xl font-[600] mb-4">
          {t('reservations.edit.title')} by <span className={`font-[800] `}>{selectedClient.full_name} </span>
          <span className={`text-sm font-[400] ${isDarkMode ? 'text-[#e1e1e1]' : 'text-subblack'}`}>
            {`(Reservation id: ${selectedClient.id})`}
          </span>
        </h1>
        
        <div className={`flex flex-col p-2 mb-2 rounded-xl gap-3 cursor-default ${isDarkMode ? 'bg-darkthemeitems text-whitetheme' : ' border-2 text-darkthemeitems'}`}>
          <p className="text-md mb-[-.4em] font-[500]">{selectedClient.full_name}'s preferences</p>
          <div className="">
            <p className="text-sm font-[400]">Allergies</p>
            <div className={`flex items-center btn text-sm font-[400] ${isDarkMode ? 'text-white' : ''}`}>
              {selectedClient.allergies}
            </div>
          </div>
          <div className="">
            <p className="text-sm font-[400]">Occasion</p>
            <div className={`flex items-center btn text-sm font-[400] ${isDarkMode ? 'text-white' : ''}`}>
              {selectedClient.occasion?.name}
            </div>
          </div>
          <div className="">
            <p className="text-sm font-[400]">Comment</p>
            <div className={`flex items-center btn text-sm font-[400] ${isDarkMode ? 'text-white' : ''}`}>
              {selectedClient.commenter}
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div>
            <BaseSelect
              label={t('reservations.edit.informations.madeBy')}
              placeholder={t('reservations.edit.source.placeholder')}
              options={[
              { label: 'Market Place', value: 'MARKETPLACE' },
              { label: 'Widget', value: 'WIDGET' },
              { label: 'Website', value: 'WEBSITE' },
              { label: 'Back Office', value: 'BACK_OFFICE' },
              { label: 'Walk In', value: 'WALK_IN' }
              ]}
              value={selectedClient.source}
              onChange={(value) => setSelectedClient({...selectedClient, source: value as ReservationSource})}
              variant={isDarkMode ? "filled" : "outlined"}
              clearable={true}
              searchable={true}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium ">{t('reservations.edit.informations.internalNote')}</label>
            <input
              type="text"
              name="internal_note"
              value={selectedClient.internal_note}
              onChange={(e) => setSelectedClient({...selectedClient, internal_note: e.target.value})}
              className={`w-full rounded-md p-2 ${isDarkMode ? 'bg-darkthemeitems text-whitetheme' : 'bg-softgreytheme text-subblack'}`}
            />
          </div>
          
          <div className="">
            <label className="block text-sm font-medium ">{t('reservations.edit.informations.status')}</label>
            <select
              name="status"
              value={selectedClient.status}
              onChange={(e) => {
                setSelectedClient({...selectedClient, status: e.target.value as ReservationStatus});
                statusHandler(e.target.value as ReservationStatus);
              }}
              className={`w-full rounded-md p-2 ${isDarkMode ? 'bg-darkthemeitems text-whitetheme' : 'bg-softgreytheme text-subblack'}`}
            >
              <option value="PENDING">{t('reservations.statusLabels.pending')}</option>
              <option value="APPROVED">{t('reservations.statusLabels.confirmed')}</option>
              <option value="CANCELED">{t('reservations.statusLabels.cancelled')}</option>
              <option value="SEATED">{t('reservations.statusLabels.seated')}</option>
              <option value="NO_SHOW">{t('reservations.statusLabels.noShow')}</option>
              {/* <option value="RESCHEDULED">{t('reservations.statusLabels.rescheduled')}</option> */}
            </select>
          </div>
          <div>
            <BaseSelect
              label={t('reservations.edit.informations.occasion')}
              options={occasions.map(occasion => ({
                label: occasion.name,
                value: occasion.id
              }))}
              value={selectedOccasion}
              onChange={(value) => {
                setSelectedOccasion(value as number);
                const selectedOccasionObj = occasions.find(occasion => occasion.id === value) || undefined;
                setSelectedClient({...selectedClient, occasion: selectedOccasionObj })
              }}
              variant="filled"
              clearable={true}
              searchable={true}
            />
          </div>
          {(selectedClient.status === ('APPROVED') || selectedClient.status === ('SEATED')) && (
            <BaseSelect
            label={t('reservations.edit.informations.table')}
            placeholder={t('reservations.edit.tables.placeholder')}
            multiple
            chips={true}
            options={[
              ...(availableTables?.map(table => ({
                label: `${table.name} (${table.floor_name})`,
                value: table.id
              })) || [])
            ]}
            value={selectedTables || []}
            onChange={(value) => {
              const tableValue = value as number[];
              (tableValue?.length) ? setHasTable(true) : setHasTable(false);
              setSelectedTables(tableValue);
              // setSelectedClient({...selectedClient, tables: tableValue})
            }}
            searchable={true}
            clearable={true}
            variant="filled"
            loading={isLoadingTables}
            hint={isLoadingTables ? "Loading available tables..." : ""}
            persistentHint={isLoadingTables}
            error={false}
          />
          )}
          
          <div 
            onClick={() => {setShowProcess(true)}} 
            className={`btn flex justify-around cursor-pointer ${isDarkMode ? 'bg-darkthemeitems text-white' : 'bg-white'}`}
          >
            {(reservationProgressData.reserveDate === '') ? <div>date </div> : <span>{reservationProgressData.reserveDate}</span>}
            {(reservationProgressData.time === '') ? <div>Time </div> : <span>{reservationProgressData.time}</span>} 
            {(reservationProgressData.guests === 0) ? <div>Guests </div> : <span>{reservationProgressData.guests}</span>}
          </div>
          
          <div className="h-10 sm:hidden"></div>
          <div className="flex justify-center lt-sm:fixed lt-sm:bottom-0 lt-sm: lt-sm:p-3 lt-sm:w-full space-x-2">
            <button 
              onClick={() => {
                setShowModal(false)
              }} 
              className="btn-secondary hover:bg-[#88AB6150] hover:text-greentheme transition-colors"
            >
              {t('reservations.edit.buttons.cancel')}
            </button>
            <button onClick={()=>{upDateHandler(selectedClient)}} className="btn-primary">
              {t('reservations.edit.buttons.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditReservationModal;