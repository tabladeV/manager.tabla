import { BaseRecord, CanAccess, useCreate, useList } from "@refinedev/core"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link, Outlet } from "react-router-dom"
import { useDarkContext } from "../../context/DarkContext"

const DesignPlacesIndex = () => {
  const { t } = useTranslation()
  const { darkMode } = useDarkContext();

  const { mutate } = useCreate({
    resource: "api/v1/bo/floors/", // Updated endpoint
    mutationOptions: {
      retry: 3,
      onSuccess: (data) => {
        refetch();
        setShowAddPlace(false);
      }
    },
    errorNotification(error, values, resource) {
      return {
        type: 'error',
        message: error?.formattedMessage,
      };
    },
  });

  const handleAddFloor = async () => {
    const inputPlace = document.getElementById('inputPlace') as HTMLInputElement;

    mutate({
      values: {
        name: inputPlace.value.trim(),
        tables: []
      }
    });
  };

  const [roofs, setRoofs] = useState<BaseRecord[]>([])
  const { data: floors, isLoading, error, refetch } = useList({
    resource: 'api/v1/bo/floors/'
  })

  useEffect(() => {
    if (floors?.data) {
      setRoofs(floors.data as BaseRecord[])
    }
  }, [floors])

  const [showAddPlace, setShowAddPlace] = useState(false);
  return (
    <div>
      {showAddPlace && (
        <div>
          <div className='overlay' onClick={() => setShowAddPlace(false)}></div>
          <form className="popup gap-5 bg-white dark:bg-bgdarktheme" onSubmit={(e) => {
            e.preventDefault()
            handleAddFloor();
          }} >
            <h1 className='text-3xl font-[700]'>Add Place</h1>
            <input
              type="text"
              autoFocus={true}
              id='inputPlace'
              placeholder='Place Alias'
              className="inputs-unique bg-white dark:bg-darkthemeitems text-black dark:text-textdarktheme"
            />
            <button onSubmit={(e) => { e.preventDefault() }} onClick={(e) => {
              e.preventDefault();
              handleAddFloor();
            }} className='btn-primary w-full'>Add Place</button>
          </form>
        </div>
      )}
      {(window.location.pathname === '/places/design/' || window.location.pathname === '/places/design') ?
        <div>
          <div className='flex justify-start gap-3 mb-2'>
            <Link to='/places' className='hover:bg-softgreentheme px-4 items-center flex justify-center text-greentheme font-bold rounded-[10px]' >{'<'}</Link>
            <h1 className='text-3xl font-[700]'>Select a floor to modify</h1>
          </div>
          <div className='flex gap-3'>
            <CanAccess resource="floor" action="add">
              <button
                className="btn hover:text-greentheme hover:border-greentheme dark:text-white"
                onClick={() => setShowAddPlace(true)}
              >
                +
              </button>
            </CanAccess>
            <div className="max-w-[80%] overflow-x-scroll no-scrollbar flex gap-3">
              {roofs.map((roof) => (
                <div
                  key={roof.id}
                  className="btn-secondary gap-3 flex"
                >
                  <Link to={`/places/design/${roof.id}`} className='flex gap-3'>
                    {roof.name}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
        :
        <Outlet />
      }
    </div>
  )
}

export default DesignPlacesIndex
