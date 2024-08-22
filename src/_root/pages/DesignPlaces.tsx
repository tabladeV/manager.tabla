import React, { useState } from 'react';
import Canvas from '../../components/places/design/Canvas';
import { Link } from 'react-router-dom';

const DesignPlaces: React.FC = () => {
    const [showAddPlace, setShowAddPlace] = useState(false);
    const [focusedRoof, setFocusedRoof] = useState<string | null>('Main Room');
    const [roofs, setRoofs] = useState<string[]>(['Main Room', 'Outdoor', 'Terrace']);
    
    const tablesEachRoof = {
        'Main Room': [{ number: 1 }, { number: 2 }, { number: 3 }, { number: 4 }],
        'Outdoor': [{ number: 5 }, { number: 6 }, { number: 7 }, { number: 8 }],
        'Terrace': [{ number: 9 }, { number: 10 }, { number: 11 }, { number: 12 }],
    };

    const deleteRoof = (roof: string) => {
        setRoofs(prevRoofs => prevRoofs.filter(r => r !== roof));
        if (focusedRoof === roof) {
            setFocusedRoof(null);
        }
    };

    return (
        <div>
            <div className='flex justify-start gap-3 mb-2'>
                <Link to='/places' className='hover:bg-softgreentheme px-4 items-center flex justify-center text-greentheme font-bold rounded-[10px]' >{'<'}</Link>
                <h1 className='text-3xl text-blacktheme font-[700]'>Edit On Your Roofs</h1>
            </div>
            <div className='flex gap-5'>
                {roofs.map((roof) => (
                    <div
                        key={roof}
                        className={`${
                            focusedRoof === roof ? 'btn-primary' : 'btn-secondary'
                        } gap-3 flex`}
                    >
                        <button onClick={() => setFocusedRoof(roof)}>
                            {roof}
                        </button>
                        <button className='' onClick={() => deleteRoof(roof)}>
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
                                        fill="#DEE5D6"
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
            </div>

            <Canvas />
        </div>
    );
};

export default DesignPlaces;
