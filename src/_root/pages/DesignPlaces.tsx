import React, { useEffect, useState } from 'react';
import DesignCanvas from '../../components/places/design/DesignCanvas';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BaseKey, BaseRecord, useList } from '@refinedev/core';

const DesignPlaces: React.FC = () => {

  const { data, isLoading, error } = useList({
    resource: "api/v1/bo/floors",
    meta: {
      headers: {
        "X-Restaurant-ID": 1,
      },
    },
  });

    const [showAddPlace, setShowAddPlace] = useState(false);
    const [focusedRoof, setFocusedRoof] = useState<BaseKey | undefined>(1);
    const [roofs, setRoofs] = useState<BaseRecord[]>([]);

    useEffect(() => {
        if (data?.data) {
            setRoofs(data.data.map((roof: BaseRecord) => ({ id: roof.id, name: roof.name })));
        }
        
    }, [data]);
    
    
    const deleteRoof = (roofId: BaseKey) => {
        if (!confirm('Are you sure you want to delete this roof?')) {
            return;
        }
        setRoofs(prevRoofs => prevRoofs.filter(r => r.id !== roofId));
        if (focusedRoof === roofId) {
            setFocusedRoof(undefined);
        }
    };


    
  const handlePlaceAdded = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const inputPlace = document.getElementById('inputPlace') as HTMLInputElement;
    const place = inputPlace.value.trim();

    if (place && !roofs.some(roof => roof.name === place)) {
      setRoofs((prevRoofs) => [...prevRoofs, { name: place }]);
    }

    setShowAddPlace(false);
  };

  const { t } = useTranslation();

    return (
        <div>
            {showAddPlace && (
                <div>
                <div className='overlay' onClick={() => setShowAddPlace(false)}></div>
                <form className={`popup gap-5 ${localStorage.getItem('darkMode')==='true'?'bg-bgdarktheme':'bg-white'}`} onSubmit={handlePlaceAdded}>
                    <h1 className='text-3xl font-[700]'>Add Place</h1>
                    <input
                    type="text"
                    id='inputPlace'
                    placeholder='Place Alias'
                    className={`inputs-unique ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems text-textdarktheme':'bg-white text-black'} `}
                    />
                    <button className='btn-primary w-full'>Add Place</button>
                </form>
                </div>
            )}
            <div className='flex justify-start gap-3 mb-2'>
                <Link to='/places' className='hover:bg-softgreentheme px-4 items-center flex justify-center text-greentheme font-bold rounded-[10px]' >{'<'}</Link>
                <h1 className='text-3xl font-[700]'>{t('editPlace.title')}</h1>
            </div>
            <div className='flex gap-5'>
                {roofs.map((roof) => (
                    <div
                        key={roof.id}
                        className={`${
                            focusedRoof === roof.id ? 'btn-primary' : 'btn-secondary'
                        } gap-3 flex`}
                    >
                        <button onClick={() => setFocusedRoof(roof.id)}>
                            {roof.name}
                        </button>
                        <button className='' onClick={() => roof.id && deleteRoof(roof.id)}>
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
                                        fill={localStorage.getItem('darkMode')==='true'?'#1e1e1e50':'#e1e1e1'}
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
                    </div>
                ))}
                <button
                className={`btn hover:text-greentheme hover:border-greentheme ${localStorage.getItem('darkMode')==='true'?'text-white':''}`}
                onClick={() => setShowAddPlace(true)}
              >
                +
              </button>
            </div>

            <DesignCanvas focusedRoofId={focusedRoof}/>
        </div>
    );
};

export default DesignPlaces;
