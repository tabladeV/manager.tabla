import { ArrowLeft, ArrowRight } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import BaseSelect from '../common/BaseSelect';


interface PaginationProps {
  count: number;
  size: number;
  setPage: (page: number) => void;
  page: number;
}

const Pagination = (props: PaginationProps) => {
  const { count, size, setPage, page } = props;
  const pages = Math.ceil(count / size);

  // Create options for the select dropdown
  const pageOptions = Array.from({length: pages}, (_, i) => ({
    value: (i + 1).toString(),
    label: `Page ${i + 1}`
  }));

  if (pages <= 1) {
    return null; // Don't render pagination if there's only one page or less
  }

  return (
    <div>
        <div className="flex justify-center items-center gap-4">
            <button className="btn-secondary" onClick={() => page > 1 ? setPage(page - 1): null} disabled={page <= 1}>
              <ArrowLeft size={20}/>
            </button>
            
            {pages <= 5 ? (
              // Display buttons for each page when pages <= 5
              Array.from({length: pages}, (_, i) => i + 1).map((p) => (
                <button 
                  key={p} 
                  className={`${page === p ? 'btn-primary' : 'btn-secondary'}`} 
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))
            ) : (
              // Use BaseSelect when pages > 4
              <div className="w-full flex justify-end my-1">
                <div className='w-[150px]'>
                  <select
                    value={page.toString()}
                    onChange={(e) => setPage(Number(e.target.value))}
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
            
            <button className="btn-secondary" onClick={() => page < pages ? setPage(page + 1): null} disabled={page >= pages}>
              <ArrowRight size={20}/>
            </button>
        </div>
    </div>
  )
}

export default Pagination