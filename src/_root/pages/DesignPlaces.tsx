import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import DesignCanvas from '../../components/places/design/DesignCanvas';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BaseKey, BaseRecord, CanAccess, useCreate, useDelete, useList, useNotification, useUpdate } from '@refinedev/core';
import { Plus } from 'lucide-react';
import ActionPopup from '../../components/popup/ActionPopup';
import { useDarkContext } from '../../context/DarkContext';
import SlideGroup from '../../components/common/SlideGroup';


export interface Table extends BaseRecord {
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
  blocked: boolean;
}
export interface DesignElement extends BaseRecord {
  id: BaseKey | undefined;
  name?: string; // Optional, as assets might not have names
  type: 'SINGLE_DOOR' | 'DOUBLE_DOOR' | 'PLANT1' | 'PLANT2' | 'PLANT3' | 'PLANT4' | 'STAIRE' | 'STAIRE2' | string;
  rotation: number;
  width: number;
  height: number;
  x: number;
  y: number;
  src?: string; // For image-based assets
  max?: number; // Optional
  min?: number; // Optional
  floor?: BaseKey; // Optional
  reservations?: BaseKey[]; // Optional
  blocked?: boolean; // Optional
}

const DesignPlaces: React.FC = () => {
  const { roofId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { open } = useNotification();
  const { darkMode } = useDarkContext();
  // Update document title
  useEffect(() => {
    document.title = 'Design - Table Management | Tabla'
  }, [])

  const [floorName, setFloorName] = useState<string | undefined>(undefined);

  // API hooks
  const { mutate: upDateFloor, isLoading: loadingUpdate } = useUpdate({
    resource: 'api/v1/bo/floors',
    errorNotification(error, values, resource) {
      return {
        type: 'error',
        message: error?.formattedMessage,
      };
    },
  });
  const { mutate: mutateDeleting } = useDelete();
  const { mutate } = useCreate({
    resource: 'api/v1/bo/floors/',
    errorNotification(error, values, resource) {
      return {
        type: 'error',
        message: error?.formattedMessage,
      };
    },
  });

  // Local state
  const [showAddPlace, setShowAddPlace] = useState(false);
  const [focusedRoof, setFocusedRoof] = useState<BaseKey | undefined>(roofId ? roofId : 1);
  const [focusedFloorTables, setFocusedFloorTables] = useState<any[]>([]);
  const [focusedFloorAssets, setFocusedFloorAssets] = useState<any[]>([]);
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

  // Update thisFloor and focused floor tables/assets when oneFloor is loaded
  useEffect(() => {
    if (oneFloor?.data) {
      setThisFloor(oneFloor.data as BaseRecord);
      setFocusedFloorTables((oneFloor.data as BaseRecord).tables || []);
      setFocusedFloorAssets((oneFloor.data as BaseRecord).assets || []);
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
  const saveFloor = useCallback((tables: any[], assets: any[]) => {
    if (!roofId) return;
    upDateFloor({
      id: roofId + '/',
      values: { tables, assets },
    },
      {
        onSuccess: () => {
          setIsSaved(true);
        },
      }
    );
    console.log({ tables, assets });
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
        tables: [], // Initialize with empty tables array
        assets: [], // Initialize with empty assets array
      },
      successNotification: () => ({
        message: `${placeName} Successfully Added.`,
        type: "success",
      }),
      errorNotification(error, values, resource) {
        return {
          type: 'error',
          message: error?.formattedMessage,
        };
      },
    },
    );
    input.value = '';
    setShowAddPlace(false);
  }, [mutate]);

  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [pendingRoofId, setPendingRoofId] = useState<BaseKey | null>(null);
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [action, setAction] = useState<'delete' | 'create' | 'update' | 'confirm'>('delete');

  // Update focused floor tables/assets when focusedRoof changes
  const [newTables, setNewTables] = useState<any[]>([]);
  const [newAssets, setNewAssets] = useState<DesignElement[]>([]);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  console.log(newTables, 'new tables');

  // Helper function to compare arrays of tables or assets
  const areArraysEqual = useCallback((arr1: any[], arr2: any[]) => {
    if (arr1.length !== arr2.length) return false;

    // Create normalized versions for comparison (sorting by ID and including only essential properties)
    const normalize = (items: any[]) => items
      .map(item => ({
        id: item.id,
        type: item.type,
        x: Math.round(item.x * 100) / 100, // Round to reduce floating point comparison issues
        y: Math.round(item.y * 100) / 100,
        width: Math.round(item.width * 100) / 100,
        height: Math.round(item.height * 100) / 100,
        rotation: Math.round(item.rotation * 100) / 100,
        name: item.name,
        max: item.max,
        min: item.min,
        blocked: item.blocked,
        src: item.src,
      }))
      .sort((a, b) => String(a.id).localeCompare(String(b.id)));
    
    return JSON.stringify(normalize(arr1)) === JSON.stringify(normalize(arr2));
  }, []);

  const navigationHandler = useCallback((roofId: BaseKey) => {
    // Check if no changes have been made or if changes are already saved
    if (areArraysEqual(newTables, focusedFloorTables) && 
        areArraysEqual(newAssets, focusedFloorAssets) || isSaved) {
      navigate(`/places/design/${roofId}`);
      setIsSaved(false);
    } else {
      setMessage("Are you sure you want to leave this page? Changes will not be saved.");
      setAction("confirm");
      setPendingRoofId(roofId);
      setShowConfirmPopup(true);
    }
  }, [newTables, newAssets, focusedFloorTables, focusedFloorAssets, navigate, isSaved, areArraysEqual]);

  const handleSave = useCallback(() => {
    if (!roofId || !pendingRoofId) return;
    upDateFloor(
      {
        id: roofId + '/',
        values: { tables: newTables, assets: newAssets }, // Send separate tables and assets arrays
      },
      {
        onSuccess: () => {
          setFocusedRoof(pendingRoofId);
          navigate(`/places/design/${pendingRoofId}`);
          setIsSaved(false);
        },
      }
    );
  }, [pendingRoofId, newTables, newAssets, navigate, roofId, upDateFloor]);

  const handleSecondAction = useCallback(() => {
    navigate(`/places/design/${pendingRoofId}`);
  }, [navigate, pendingRoofId]);



  // Delete request handler

  const handleDeleteRequest = (roofId: BaseKey) => {
    setMessage("Are you sure you want to delete this roof?");
    setAction("delete");
    setPendingRoofId(roofId);
    setShowConfirmPopup(true);
  };

  const deleteRoof = useCallback(async () => {
    if (!pendingRoofId) return;

    mutateDeleting(
      {
        resource: "api/v1/bo/floors",
        id: pendingRoofId + "/",
        successNotification: () => ({
          message: "Successfully Deleted Floor.",
          type: "success",
        }),
        errorNotification: (error) => ({
          type: "error",
          message: error?.formattedMessage,
        }),
      },
      {
        onSuccess: () => {
          refetchFloors().then((response) => {
            console.log("Roof deleted successfully!");
          });
        },
        onError: (error) => {
          console.error("Error deleting roof:", error);
          alert("Failed to delete roof. Please try again.");
        },
      }
    );
  }, [pendingRoofId, mutateDeleting, refetchFloors]);

  const handleCancel = useCallback(() => {
    setShowConfirmPopup(false);
  }, []);

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
    return (
      <SlideGroup>
        {roofs.map((roof) => (
          <div
            key={roof.id}
            className={`${window.location.pathname === `/places/design/${roof.id}` ? 'btn-primary' : 'btn-secondary'} gap-3 flex`}
          >
            <button
              onClick={() => {
                if (areArraysEqual(newTables, focusedFloorTables) && 
                    areArraysEqual(newAssets, focusedFloorAssets)) {
                  navigate(`/places/design/${roof.id}`);
                  setFocusedRoof(roof.id);
                  setFloorName(roof.name);
                } else {
                  roof.id && navigationHandler(roof.id);
                }
              }}
              className="flex gap-3"
            >
              {roof.name}
            </button>
            <CanAccess resource="floor" action="delete">
              <button onClick={() => roof.id && handleDeleteRequest(roof.id)}>
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
                      fill={darkMode ? '#1e1e1e50' : '#e1e1e1'}
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
        ))}
      </SlideGroup>
    )
  }, [roofs, handleDeleteRequest, navigate, setFocusedRoof, setFloorName, navigationHandler, newTables, focusedFloorTables, newAssets, focusedFloorAssets, areArraysEqual]);

  return (
    <div>
      {<ActionPopup
        action={action}
        secondAction={action === 'delete' ? handleCancel : handleSecondAction}
        secondActionText={action === 'delete' ? 'Cancel' : 'Leave'}
        message={message}
        actionFunction={action === 'delete' ? deleteRoof : handleSave}
        showPopup={showConfirmPopup}
        setShowPopup={setShowConfirmPopup}
      />

      }
      {showAddPlace && (
        <div>
          <div className="overlay" onClick={() => setShowAddPlace(false)}></div>
          <form
            className={`bg-white popup gap-5 dark:bg-bgdarktheme`}
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
              className={`bg-white text-black inputs-unique dark:bg-darkthemeitems dark:text-textdarktheme`}
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
      <div className='flex mb-2'>
        <div className="flex justify-start items-center gap-2 mb-2 w-[30%]">
          <Link
            to="/places/design"
            className="hover:bg-softgreentheme px-4 items-center flex justify-center text-greentheme font-bold rounded-[10px] size-[40px]"
          >
            {'<'}
          </Link>
          <h3 className="font-[700]">{t('editPlace.title')}</h3>
        </div>
        <div className="flex gap-1 w-[70%] justify-end">
          <div className="max-w-[90%]">
            {roofsList}
          </div>
          <CanAccess resource="floor" action="add">
            <button
              className={`btn-primary dark:text-white`}
              onClick={() => setShowAddPlace(true)}
            >
              <Plus />
            </button>
          </CanAccess>
        </div>
      </div>
      <DesignCanvas
        isLoading={isLoading || loadingUpdate || oneFloorLoading}
        onSave={(tables, assets) => saveFloor(tables, assets)}
        tables={focusedFloorTables}
        assets={focusedFloorAssets}
        focusedRoofId={focusedRoof}
        newTables={(tables, assets) => {
          setNewTables(tables);
          setNewAssets(assets);
        }}
        floorName={floorName}
      />
    </div>
  );
};

export default DesignPlaces;
