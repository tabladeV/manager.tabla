import { BaseKey, BaseRecord, useCreate, useDelete, useList, useUpdate } from "@refinedev/core"
import { Trash } from "lucide-react"
import { useState, useCallback, useEffect } from "react"
import { useTranslation } from "react-i18next"

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
  if (!isOpen) return null;
  
  const isDarkMode = localStorage.getItem('darkMode') === 'true';
  
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
              placeholder="Name" 
              className={`inputs ${isDarkMode ? 'bg-darkthemeitems' : 'bg-white'}`} 
              value={occasion?.name || ''} 
              onChange={onInputChange} 
              required 
            />
            <textarea 
              id="description" 
              placeholder="Description" 
              className={`inputs ${isDarkMode ? 'bg-darkthemeitems' : 'bg-white'}`} 
              value={occasion?.description || ''} 
              onChange={onInputChange} 
            />
            <div className="flex items-center">
              <label htmlFor="color" className="mr-2">Color:</label>
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
                Cancel
              </button>
              <button onClick={onUpdateOccasion} className="btn-primary">
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <input 
              type="text" 
              id="name" 
              placeholder="Name" 
              className={`inputs ${isDarkMode ? 'bg-darkthemeitems' : 'bg-white'}`} 
              onChange={onInputAddChange} 
              required 
            />
            <textarea 
              id="description" 
              placeholder="Description" 
              className={`inputs ${isDarkMode ? 'bg-darkthemeitems' : 'bg-white'}`} 
              onChange={onInputAddChange} 
            />
            <div className="flex items-center">
              <label htmlFor="color" className="mr-2">Color:</label>
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
                Cancel
              </button>
              <button onClick={onAddOccasion} className="btn-primary">
                Save
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
  const isDarkMode = localStorage.getItem('darkMode') === 'true';
  
  return (
    <div className="overflow-x-auto w-full">
      <table className={`w-full border-collapse text-left text-sm ${isDarkMode ? 'bg-bgdarktheme2' : 'bg-white text-gray-500'}`}>
        <thead className={`${isDarkMode ? 'bg-bgdarktheme text-white' : 'bg-white text-gray-900'}`}>
          <tr>
            <th scope="col" className="px-6 py-4 font-medium">ID</th>
            <th scope="col" className="px-6 py-4 font-medium">Name</th>
            <th scope="col" className="px-6 py-4 font-medium">Description</th>
            <th scope="col" className="px-6 py-4 font-medium">Color</th>
            <th scope="col" className="px-6 py-4 font-medium flex justify-end">Actions</th>
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
                <button 
                  className="btn-secondary bg-softredtheme text-redtheme hover:bg-redtheme hover:text-white p-2 text-right" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(occasion.id);
                  }}
                >
                  <Trash size={15} />
                </button>
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
    if (selectedOccasion) {
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

  const deleteOccasion = (id: BaseKey) => {
    if (window.confirm('Are you sure you want to delete this occasion?')) {
      deleteOccasionMutate({
        resource: `api/v1/bo/occasions`,
        id: `${id}/`,
      });
    }
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

  const isDarkMode = localStorage.getItem('darkMode') === 'true';

  return (
    <div className={`w-full rounded-[10px] flex flex-col items-center p-10 ${isDarkMode ? 'bg-bgdarktheme' : 'bg-white'}`}>
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
      <h1 className="text-2xl font-bold mb-3">{t('settingsPage.occasions.title', 'Occasions')}</h1>
      <OccasionTable 
        occasions={occasions} 
        onEdit={openModal}
        onDelete={deleteOccasion}
      />
      <div>
        <button className="btn-primary mt-4" onClick={addOccasion}>
          {t('settingsPage.occasions.buttons.addOccasion', 'Add Occasion')}
        </button>
      </div>
    </div>
  )
}