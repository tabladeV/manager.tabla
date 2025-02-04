import { BaseRecord, useCreate, useList } from "@refinedev/core"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link, Outlet } from "react-router-dom"

const DesignPlacesIndex = () => {

    const { t } = useTranslation()


    const { mutate } = useCreate({
            resource: "api/v1/bo/floors/", // Updated endpoint
            meta: {
              headers: {
                "X-Restaurant-ID": 1,
              },
            },
            mutationOptions: {
              retry: 3,
              onSuccess: (data) => {
                console.log("Floor added:", data);
              },
              onError: (error) => {
                console.log("Error adding floor:", error);
              },
            },
          });
          
          const handleAddFloor = async () => {
            const inputPlace = document.getElementById('inputPlace') as HTMLInputElement;
    
            mutate({
              values:{
                name: inputPlace.value.trim(),
                tables: []
              }
            });
    
            window.location.reload();
            
          };

    const [roofs, setRoofs] = useState<BaseRecord[]>([])
    const {data, isLoading, error} = useList({
        resource: 'api/v1/bo/floors/',
        meta: {
          headers: {
            'X-Restaurant-ID': 1
          }
        }
      })
    

      console.log('roofs',data?.data)
      useEffect(() => {
        if (data?.data) {
          setRoofs(data.data as BaseRecord[])
        }
      }, [data])


      const [showAddPlace, setShowAddPlace] = useState(false);
  return (
    <div>
        {showAddPlace && (
            <div>
            <div className='overlay' onClick={() => setShowAddPlace(false)}></div>
            <form className={`popup gap-5 ${localStorage.getItem('darkMode')==='true'?'bg-bgdarktheme':'bg-white'}`}  >
                <h1 className='text-3xl font-[700]'>Add Place</h1>
                <input
                type="text"
                id='inputPlace'
                placeholder='Place Alias'
                className={`inputs-unique ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems text-textdarktheme':'bg-white text-black'} `}
                />
                <button onClick={handleAddFloor} className='btn-primary w-full'>Add Place</button>
            </form>
            </div>
        )}
        {(window.location.pathname === '/places/design/'|| window.location.pathname === '/places/design')? 
        <div>
            <div className='flex justify-start gap-3 mb-2'>
                <Link to='/places' className='hover:bg-softgreentheme px-4 items-center flex justify-center text-greentheme font-bold rounded-[10px]' >{'<'}</Link>
                <h1 className='text-3xl font-[700]'>Select a floor to modify</h1>
            </div>
            <div className='flex overflow-y-scroll w-[80vw] mx-auto  no-scrollbar gap-5'>
                {roofs.map((roof) => (
                    <div
                        key={roof.id}
                        className={`btn-secondary gap-3 flex`}
                    >
                        <Link to={`/places/design/${roof.id}`} className='flex gap-3'>
                            {roof.name}
                        </Link>
                    </div>
                ))}
                <button
                    className={`btn hover:text-greentheme hover:border-greentheme ${localStorage.getItem('darkMode')==='true'?'text-white':''}`}
                    onClick={() => setShowAddPlace(true)}
                >
                    +
                </button>
            </div>
        </div>
        :
        <Outlet />
        }

    </div>
  )
}

export default DesignPlacesIndex
