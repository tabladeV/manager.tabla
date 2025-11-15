import { BaseKey, BaseRecord, useCreate, useDelete, useList, useUpdate, useCan, CanAccess } from "@refinedev/core"
import { Trash } from "lucide-react"
import { useState, useCallback, useEffect, useContext } from "react"
import { useTranslation } from 'react-i18next';
import { useDarkContext } from "../../context/DarkContext"
import ActionPopup from "../popup/ActionPopup"

// Interfaces
export interface Occasion {
  id: number
  name: string
  description: string
  color: string
}

export interface OccasionsType {
  results: Occasion[]
  count: number
}

const initialOccasions: Occasion[] = []

// OccasionModal Component
interface OccasionModalProps {
  isOpen: boolean;
  isUpdating: boolean;
  occasion: Occasion | null;
  newOccasion: Occasion;
  onClose: () => void;
  onAddOccasion: () => void;
  onUpdateOccasion: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onInputAddChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

function OccasionModal({
  isOpen,
  isUpdating,
  occasion,
  newOccasion,
  onClose,
  onAddOccasion,
  onUpdateOccasion,
  onInputChange,
  onInputAddChange
}: OccasionModalProps) {
  const { darkMode:isDarkMode } = useDarkContext();
  const { t } = useTranslation();

  if (!isOpen) return null;
  
  
  return (
    <div>
      <div className="overlay" onClick={onClose}></div>
      <div className={`sidepopup lt-sm:popup lt-sm:h-[70vh] lt-sm:bottom-0 lt-sm:rounded-b-none lt-sm:w-full h-full ${isDarkMode ? 'bg-bgdarktheme' : 'bg-white'}`}>
        <h1 className="text-2xl font-bold mb-3">{isUpdating ? 'Modify' : 'Add'} Occasion</h1>
        {isUpdating ? (
          <div className="flex flex-col gap-3">
            <input 
              type="text" 
              id="name" 
              placeholder={t('settingsPage.occasions.placeHolders.name')}
              className={`inputs ${isDarkMode ? 'bg-darkthemeitems' : 'bg-white'}`} 
              value={occasion?.name || ''} 
              onChange={onInputChange} 
              required 
            />
            <textarea 
              id="description" 
              placeholder={t('settingsPage.occasions.placeHolders.description')}
              className={`inputs ${isDarkMode ? 'bg-darkthemeitems' : 'bg-white'}`} 
              value={occasion?.description || ''} 
              onChange={onInputChange} 
            />
            <div className="flex items-center">
              <label htmlFor="color" className="mr-2">{t('settingsPage.occasions.labels.color')}:</label>
              <input 
                type="color" 
                id="color" 
                className="w-10 h-10" 
                value={occasion?.color || '#000000'} 
                onChange={onInputChange} 
              />
            </div>
            <div className="flex justify-center gap-4">
              <button type="button" className={isDarkMode ? 'btn text-white hover:text-redtheme border-white hover:border-redtheme' : 'btn'} onClick={onClose}>
                {t('settingsPage.occasions.buttons.cancel', 'Cancel')}
              </button>
              <button onClick={onUpdateOccasion} className="btn-primary">
                {t('settingsPage.occasions.buttons.save', 'Save')}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <input 
              type="text" 
              id="name" 
              placeholder={t('settingsPage.occasions.placeHolders.name')}
              className={`inputs ${isDarkMode ? 'bg-darkthemeitems' : 'bg-white'}`} 
              onChange={onInputAddChange} 
              required 
            />
            <textarea 
              id="description" 
              placeholder={t('settingsPage.occasions.placeHolders.description')} 
              className={`inputs ${isDarkMode ? 'bg-darkthemeitems' : 'bg-white'}`} 
              onChange={onInputAddChange} 
            />
            <div className="flex items-center">
              <label htmlFor="color" className="mr-2">{t('settingsPage.occasions.labels.color')}:</label>
              <input 
                type="color" 
                id="color" 
                className="w-10 h-10" 
                value={newOccasion.color} 
                onChange={onInputAddChange} 
              />
            </div>
            <div className="flex justify-center gap-4">
              <button type="button" className={isDarkMode ? 'btn text-white hover:text-redtheme border-white hover:border-redtheme' : 'btn'} onClick={onClose}>
                {t('settingsPage.occasions.buttons.cancel', 'Cancel')}
              </button>
              <button onClick={onAddOccasion} className="btn-primary">
                {t('settingsPage.occasions.buttons.add', 'Add')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// OccasionTable Component
interface OccasionTableProps {
  occasions: Occasion[];
  onEdit: (occasion: Occasion) => void;
  onDelete: (id: BaseKey) => void;
}

function OccasionTable({ occasions, onEdit, onDelete }: OccasionTableProps) {
  const { darkMode:isDarkMode } = useDarkContext();
  const { data: canDelete } = useCan({ 
    resource: "occasion",
    action: "delete"
  });

  const { t } = useTranslation();
  
  return (
    <div className="overflow-x-auto w-full">
      <table className={`w-full border-collapse text-left text-sm ${isDarkMode ? 'bg-bgdarktheme2' : 'bg-white text-gray-500'}`}>
        <thead className={`${isDarkMode ? 'bg-bgdarktheme text-white' : 'bg-white text-gray-900'}`}>
          <tr>
            <th scope="col" className="px-6 py-4 font-medium">{t('settingsPage.occasions.tableHeaders.id', 'ID')}</th>
            <th scope="col" className="px-6 py-4 font-medium">{t('settingsPage.occasions.tableHeaders.name', 'Name')}</th>
            <th scope="col" className="px-6 py-4 font-medium">{t('settingsPage.occasions.tableHeaders.description', 'Description')}</th>
            <th scope="col" className="px-6 py-4 font-medium">{t('settingsPage.occasions.tableHeaders.color', 'Color')} </th>
            <th scope="col" className="px-6 py-4 font-medium flex justify-end">{t('settingsPage.occasions.tableHeaders.actions', 'Actions')}</th>
          </tr>
        </thead>
        <tbody className={`divide-y border-t ${isDarkMode ? 'border-darkthemeitems divide-darkthemeitems' : 'border-gray-200'}`}>
          {occasions.map((occasion) => (
            <tr key={occasion.id} className={`cursor-pointer ${isDarkMode ? 'hover:bg-bgdarktheme' : 'hover:bg-gray-50'}`}>
              <td className="px-6 py-4 font-medium" onClick={() => onEdit(occasion)}>{occasion.id}</td>
              <td className="px-6 py-4" onClick={() => onEdit(occasion)}>{occasion.name}</td>
              <td className="px-6 py-4" onClick={() => onEdit(occasion)}>{occasion.description}</td>
              <td className="px-6 py-4" onClick={() => onEdit(occasion)}>
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full mr-2" style={{ backgroundColor: occasion.color }}></div>
                  {occasion.color}
                </div>
              </td>
              <td className="px-6 py-4 flex justify-end">
                {canDelete?.can && (
                  <button 
                    className="btn-secondary bg-softredtheme text-redtheme hover:bg-redtheme hover:text-white p-2 text-right" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(occasion.id);
                    }}
                  >
                    <Trash size={15} />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Main Occasions Component
export default function Occasions() {
  useEffect(() => {
    document.title = 'Occasions Management | Tabla'
  }, [])

  const { darkMode:isDarkMode } = useDarkContext();
  const { data: canCreate } = useCan({ resource: "occasion", action: "create" });
  const { data: canChange } = useCan({ resource: "occasion", action: "change" });
  
  const [occasionsAPIInfo, setOccasionsAPIInfo] = useState<OccasionsType>()

  const { data, isLoading, error } = useList({
    resource: 'api/v1/bo/occasions/', // Placeholder API endpoint
    filters: [
      {
        field: "page_size",
        operator: "eq",
        value: 10
      },
      {
        field: "page",
        operator: "eq",
        value: 1
      }
    ],
    queryOptions: {
      onSuccess(data) {
        setOccasionsAPIInfo(data.data as unknown as OccasionsType)
      }
    },
    errorNotification(error, values, resource) {
      return {
        type: 'error',
        message: error?.formattedMessage,
      };
    },
  })

  const { mutate: updateOccasion } = useUpdate({
    resource: `api/v1/bo/occasions`, // Placeholder API endpoint
    errorNotification(error, values, resource) {
      return {
        type: 'error',
        message: error?.formattedMessage,
      };
    },
  });

  const [occasions, setOccasions] = useState<Occasion[]>(initialOccasions)
  
  useEffect(() => {
    if (occasionsAPIInfo) {
      setOccasions(occasionsAPIInfo.results as Occasion[] || occasionsAPIInfo || [])
    }
  }, [occasionsAPIInfo])
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedOccasion, setSelectedOccasion] = useState<Occasion | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  
  const openModal = useCallback((occasion: Occasion | null) => {
    setSelectedOccasion(occasion)
    setIsModalOpen(true)
    setIsUpdating(true)
  }, [])

  const closeModal = useCallback(() => {
    setSelectedOccasion(null)
    setIsModalOpen(false)
  }, [])

  const [newOccasion, setNewOccasion] = useState<Occasion>({
    id: 0,
    name: '',
    description: '',
    color: '#000000',
  })

  const handleInputAddChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewOccasion({ ...newOccasion, [e.target.id]: e.target.value })
  }, [newOccasion])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (selectedOccasion) {
      setSelectedOccasion({ ...selectedOccasion, [e.target.id]: e.target.value })
    }
  }, [selectedOccasion])

  const { t } = useTranslation();

  const { mutate: addOccasionMutate } = useCreate({
    errorNotification(error, values, resource) {
      return {
        type: 'error',
        message: error?.formattedMessage,
      };
    },
  });
  const { mutate: deleteOccasionMutate } = useDelete();

  const handleOccasionUpdate = () => {
    if (selectedOccasion && canChange?.can) {
      updateOccasion({
        resource: `api/v1/bo/occasions`,
        id: `${selectedOccasion.id}/`,
        values: {
          name: selectedOccasion.name,
          description: selectedOccasion.description,
          color: selectedOccasion.color,
        },
      });
      closeModal();
    }
  };

  const addOccasionHandler = () => {
    if (canCreate?.can) {
      addOccasionMutate({
        resource: `api/v1/bo/occasions/`,
        values: {
          name: newOccasion.name,
          description: newOccasion.description,
          color: newOccasion.color,
        },
      });
      closeModal();
    }
  }

  const [showPopup, setShowPopup] = useState(false);
  const [action, setAction] = useState<'delete' | 'update' | 'create' | 'confirm'>('delete');
  const [message, setMessage] = useState<string>('');

  const [occasionToDelete, setOccasionToDelete] = useState<BaseKey | undefined>(undefined);

  const handleDeleteRequest = (id: BaseKey) => {
    setAction('delete');
    setMessage(t('settingsPage.occasions.actionPopup.confirmDelete', ));
    setOccasionToDelete(id);
    setShowPopup(true);
  }

  const deleteOccasion = () => {
    // if (window.confirm('Are you sure you want to delete this occasion?')) {
      deleteOccasionMutate({
        resource: `api/v1/bo/occasions`,
        id: `${occasionToDelete}/`,
      },
    {
      onSuccess: () => {
        setOccasionToDelete(undefined);
        setOccasions(occasions.filter((occasion) => occasion.id !== occasionToDelete));
      }
    });
    // }
  }

  const addOccasion = useCallback(() => {
    const newOccasion: Occasion = {
      id: 0,
      name: '',
      description: '',
      color: '#000000',
    }
    setNewOccasion(newOccasion)
    setIsModalOpen(true)
    setIsUpdating(false)
  }, [])

  return (
    <div className={`w-full rounded-[10px] flex flex-col items-center p-2 ${isDarkMode ? 'bg-bgdarktheme' : 'bg-white'}`}>
      <ActionPopup
        action={action}
        message={message}
        actionFunction={() => deleteOccasion()}
        showPopup={showPopup}
        setShowPopup={setShowPopup}
      />
      <CanAccess resource="occasion" action="change">
        <OccasionModal
          isOpen={isModalOpen}
          isUpdating={isUpdating}
          occasion={selectedOccasion}
          newOccasion={newOccasion}
          onClose={closeModal}
          onAddOccasion={addOccasionHandler}
          onUpdateOccasion={handleOccasionUpdate}
          onInputChange={handleInputChange}
          onInputAddChange={handleInputAddChange}
        />
      </CanAccess>
      
      <h1 className="text-2xl font-bold mb-3">{t('settingsPage.occasions.title', 'Occasions')}</h1>
      <CanAccess resource="occasion" action="create">
        <div>
          <button className="btn-primary mt-4" onClick={addOccasion}>
            {t('settingsPage.occasions.buttons.addOccasion', 'Add Occasion')}
          </button>
        </div>
      </CanAccess>
      <OccasionTable 
        occasions={occasions} 
        onEdit={(occasion) => canChange?.can && openModal(occasion)}
        onDelete={handleDeleteRequest}
      />
      
      
    </div>
  )
}