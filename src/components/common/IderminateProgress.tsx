import React from 'react';

const IndeterminateProgress: React.FC = () => {
    return (
        <div className='w-full'>
            <div className='h-1.5 w-full bg-greentheme bg-opacity-50 overflow-hidden'>
                <div className='animate-progress w-full h-full bg-greentheme origin-left-right'></div>
            </div>
        </div>
    );
};

export default IndeterminateProgress;