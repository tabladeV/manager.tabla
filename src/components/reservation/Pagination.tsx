import { ArrowLeft, ArrowRight } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import BaseSelect from '../common/BaseSelect';


interface PaginationProps {
  count: number;
  size: number;
  setPage: (page: number) => void;
}

const Pagination = (props: PaginationProps) => {
  const pages = Math.ceil(props.count / props.size);
  const [currentPage, setCurrentPage] = useState(1);
  
  useEffect(() => {
    props.setPage(currentPage);
  }, [currentPage, props]);

  // Create options for the select dropdown
  const pageOptions = Array.from({length: pages}, (_, i) => ({
    value: (i + 1).toString(),
    label: `Page ${i + 1}`
  }));

  return (
    <div>
        <div className="flex justify-center items-center gap-4">
            <button className="btn-secondary" onClick={() => currentPage >1 ? setCurrentPage(currentPage - 1): null}>
              <ArrowLeft size={20}/>
            </button>
            
            {pages <= 5 ? (
              // Display buttons for each page when pages <= 5
              Array.from({length: pages}, (_, i) => i + 1).map((page) => (
                <button 
                  key={page} 
                  className={`${currentPage === page ? 'btn-primary' : 'btn-secondary'}`} 
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))
            ) : (
              // Use BaseSelect when pages > 4
              <div className="w-full flex justify-end my-1">
                <div className='w-[150px]'>
                  <select
                    value={currentPage.toString()}
                    onChange={(e) => setCurrentPage(Number(e.target.value))}
                    className={`w-full p-2 rounded-md border border-[#dddddd] dark:border-[#444444] bg-white dark:bg-darkthemeitems focus:outline-none focus:ring-2 focus:ring-[#88AB61]`}
                  >
                    {pageOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            
            <button className="btn-secondary" onClick={() => currentPage < pages ? setCurrentPage(currentPage + 1): null}>
              <ArrowRight size={20}/>
            </button>
        </div>
    </div>
  )
}

export default Pagination
