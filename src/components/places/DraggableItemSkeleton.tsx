import React from 'react';

interface DraggableItemSkeletonProps {
  count?: number;
  isDarkMode?: boolean;
}

const DraggableItemSkeleton: React.FC<DraggableItemSkeletonProps> = ({ 
  count = 1,
  isDarkMode = false 
}) => {
  const skeletonColor = isDarkMode ? 'bg-darkthemeitems' : 'bg-gray-300';
  const baseColor = isDarkMode ? 'bg-bgdarktheme2' : 'bg-softgreytheme';
  
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div 
          key={index}
          className={`p-3 flex flex-col rounded-[10px] mb-3 animate-pulse ${baseColor}`}
        >
          <div className='flex justify-between'>
            <div className='flex items-center'>
              {/* Time and Date */}
              <div className="w-[5vw] flex flex-col text-center items-center">
                <div className={`h-5 w-12 ${skeletonColor} rounded mb-1`}></div>
                <div className={`h-3 w-16 ${skeletonColor} rounded`}></div>
              </div>
              
              {/* Divider */}
              <div className='border border-[#00000010] mx-2 border-solid h-full'></div>
              
              {/* Name and Details */}
              <div>
                <div className={`h-5 w-32 ${skeletonColor} rounded mb-2`}></div>
                <div className='flex gap-3'>
                  {/* Guest Count */}
                  <div className='flex gap-1 items-center'>
                    <div className={`h-4 w-4 ${skeletonColor} rounded-full`}></div>
                    <div className={`h-4 w-16 ${skeletonColor} rounded`}></div>
                  </div>
                  
                  {/* Occasion */}
                  <div className='flex gap-1 items-center'>
                    <div className={`h-4 w-4 ${skeletonColor} rounded-full`}></div>
                    <div className={`h-4 w-20 ${skeletonColor} rounded`}></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Edit Button */}
            <div className={`h-7 w-7 ${skeletonColor} rounded-full`}></div>
          </div>
          
          {/* Table Chips */}
          <div className="flex flex-wrap gap-1 max-w-full mt-3">
            <div className={`h-6 w-20 ${skeletonColor} rounded-full`}></div>
            <div className={`h-6 w-16 ${skeletonColor} rounded-full`}></div>
          </div>
        </div>
      ))}
    </>
  );
};

export default DraggableItemSkeleton;