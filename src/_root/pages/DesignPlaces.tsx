import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import DesignCanvas from '../../components/places/design/DesignCanvas';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BaseKey, BaseRecord, CanAccess, useCreate, useDelete, useList, useNotification, useUpdate } from '@refinedev/core';

interface Table extends BaseRecord {
  id: BaseKey | undefined;
  name: string;
  type: string;
  rotation: number;
  width: number;
  height: number;
  x: number;
  y: number;
  max: number;
  min: number;
  floor: BaseKey;
  reservations: BaseKey[];
}

const DesignPlaces: React.FC = () => {
  const { roofId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { open } = useNotification();

  
  // API hooks
  const { mutate: upDateFloor } = useUpdate({
    resource: 'api/v1/bo/floors',
  });
  const { mutate: mutateDeleting } = useDelete();
  const { mutate } = useCreate({
    resource: 'api/v1/bo/floors/',
    mutationOptions: {
      onError: (error) => console.log('Error adding floor:', error),
    },
  });

  // Local state
  const [showAddPlace, setShowAddPlace] = useState(false);
  const [focusedRoof, setFocusedRoof] = useState<BaseKey | undefined>(roofId ? roofId : 1);
  const [focusedFloorTables, setFocusedFloorTables] = useState<Table[]>([]);
  const [roofs, setRoofs] = useState<BaseRecord[]>([]);
  const [thisFloor, setThisFloor] = useState<BaseRecord | undefined>(undefined);

  // Refs for form inputs
  const inputPlaceRef = useRef<HTMLInputElement>(null);

  // Query one floor based on roofId
  const { data: oneFloor, isLoading: oneFloorLoading } = useList({
    resource: `api/v1/bo/floors/${roofId}/`,
  });

  // Query all roofs
  const { data, isLoading, error, refetch: refetchFloors } = useList({
    resource: 'api/v1/bo/floors/',
  });

  // Update thisFloor and focused floor tables when oneFloor is loaded
  useEffect(() => {
    if (oneFloor?.data) {
      setThisFloor(oneFloor.data as BaseRecord);
      setFocusedFloorTables((oneFloor.data as BaseRecord).tables || []);
    }
  }, [oneFloor]);

  // Memoize roofs list from all floors data
  useEffect(() => {
    if (data?.data) {
      setRoofs(
        data.data.map((roof: BaseRecord) => ({
          id: roof.id,
          name: roof.name,
        }))
      );
    }
  }, [data]);

  // Handlers
  const saveFloor = useCallback((tables: Table[]) => {
    if (!roofId) return;
    upDateFloor({
      id: roofId + '/',
      values: { tables },
    });
    console.log(tables);
  }, [roofId, upDateFloor]);

  const handleAddFloor = useCallback(() => {
    // Use ref to get the current value
    const input = inputPlaceRef.current;
    if (!input) return;
    const placeName = input.value.trim();
    if (!placeName) return;

    mutate({
      values: {
        name: placeName,
        tables: [],
      },
      successNotification: ()=>({
        message: `${placeName} Successfully Added.`,
        type: "success",
      })
    },
  );
    input.value = '';
    setShowAddPlace(false);
  }, [mutate]);

  const deleteRoof = useCallback((roofIdToDelete: BaseKey, name: string) => {
    if (!confirm('Are you sure you want to delete this roof?')) return;

    const prevRoofs = [...roofs];
    const deletedIndex = prevRoofs.findIndex((roof) => roof.id === roofIdToDelete);
    
    mutateDeleting(
      {
        resource: 'api/v1/bo/floors',
        id: roofIdToDelete + '/',
        successNotification: () => {
          return {
            message: `Successfully Deleted Floor ${name}.`,
            type: "success",
          }
        },
      },
      {
        onSuccess: () => {
          refetchFloors().then((response) => {
            
            const updatedRoofs = response?.data?.data || [];
            if (focusedRoof === roofIdToDelete) {
              if (updatedRoofs.length > 0) {
                
                let newFocusedRoof;
                if (deletedIndex < updatedRoofs.length) {
                  newFocusedRoof = updatedRoofs[deletedIndex].id;
                } else if (deletedIndex - 1 >= 0) {
                  newFocusedRoof = updatedRoofs[deletedIndex - 1].id;
                }
                setFocusedRoof(newFocusedRoof);
                
                navigate(`/places/design/${newFocusedRoof}`);
              } else {
                
                navigate("/places/design");
              }
            }
            console.log('Roof deleted successfully!');
          });
        },
        onError: (error) => {
          console.error('Error deleting roof:', error);
          alert('Failed to delete roof. Please try again.');
        },
      }
    );
  }, [roofs, focusedRoof, mutateDeleting, refetchFloors, navigate]);

  const handlePlaceAdded = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = inputPlaceRef.current;
    if (!input) return;
    const place = input.value.trim();
    if (place && !roofs.some((roof) => roof.name === place)) {
      setRoofs((prev) => [...prev, { name: place }]);
    }
    input.value = '';
    setShowAddPlace(false);
  }, [roofs]);

  // Memoized roofs list JSX
  const roofsList = useMemo(() => {
    return roofs.map((roof) => (
      <div
        key={roof.id}
        className={`${window.location.pathname === `/places/design/${roof.id}` ? 'btn-primary' : 'btn-secondary'} gap-3 flex`}
      >
        <Link
          to={`/places/design/${roof.id}`}
          onClick={() => setFocusedRoof(roof.id)}
          className="flex gap-3"
        >
          {roof.name}
        </Link>
        <CanAccess resource="floor" action="delete">
          <button onClick={() => roof.id && deleteRoof(roof.id, roof.name)}>
            <svg
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_412_5)">
                <path
                  d="M6.5 13C10.0899 13 13 10.0899 13 6.5C13 2.91015 10.0899 0 6.5 0C2.91015 0 0 2.91015 0 6.5C0 10.0899 2.91015 13 6.5 13Z"
                  fill={localStorage.getItem('darkMode') === 'true' ? '#1e1e1e50' : '#e1e1e1'}
                />
                <path
                  d="M7.06595 6.5036L8.99109 9H7.85027L6.45098 7.18705L5.14082 9H4.00891L5.93405 6.5036L4 4H5.14082L6.54902 5.82734L7.86809 4H9L7.06595 6.5036Z"
                  fill="#88AB61"
                />
              </g>
              <defs>
                <clipPath id="clip0_412_5">
                  <rect width="13" height="13" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </button>
        </CanAccess>
      </div>
    ));
  }, [roofs, deleteRoof]);

  return (
    <div>
      {showAddPlace && (
        <div>
          <div className="overlay" onClick={() => setShowAddPlace(false)}></div>
          <form
            className={`popup gap-5 ${localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme' : 'bg-white'}`}
            onSubmit={(e) => {
              e.preventDefault();
              handleAddFloor();
            }}
          >
            <h1 className="text-3xl font-[700]">Add Place</h1>
            <input
              ref={inputPlaceRef}
              autoFocus={true}
              type="text"
              placeholder="Place Alias"
              className={`inputs-unique ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems text-textdarktheme' : 'bg-white text-black'}`}
            />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleAddFloor();
              }}
              className="btn-primary w-full"
            >
              Add Place
            </button>
          </form>
        </div>
      )}
      <div className="flex justify-start gap-3 mb-2">
        <Link
          to="/places/design"
          className="hover:bg-softgreentheme px-4 items-center flex justify-center text-greentheme font-bold rounded-[10px]"
        >
          {'<'}
        </Link>
        <h1 className="text-3xl font-[700]">{t('editPlace.title')}</h1>
      </div>
      <div className="flex gap-3">
        <CanAccess resource="floor" action="add">
          <button
            className={`btn-primary ${localStorage.getItem('darkMode') === 'true' ? 'text-white' : ''}`}
            onClick={() => setShowAddPlace(true)}
          >
            +
          </button>
        </CanAccess>
        <div className="max-w-[80%] overflow-x-scroll no-scrollbar flex gap-3">
          {roofsList}
        </div>
      </div>
      <DesignCanvas
        isLoading={isLoading}
        onSave={saveFloor}
        tables={focusedFloorTables}
        focusedRoofId={focusedRoof}
      />
    </div>
  );
};

export default DesignPlaces;
