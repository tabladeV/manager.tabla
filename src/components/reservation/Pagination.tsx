import { ArrowLeft, ArrowRight } from 'lucide-react'
import React, { useEffect, useState } from 'react'

interface PaginationProps {
  count: number;
  size: number;
  setPage: (page: number) => void;
}

const Pagination = (props: PaginationProps) => {

  const pages = Math.ceil(props.count / props.size);
  const [currentPage,setCurrentPage ] = useState(1);
  useEffect(() => {
    props.setPage(currentPage);
  }, [currentPage, props]);

  return (
    <div>
        <div className="flex justify-center items-center gap-4">
            <button className="btn-secondary" onClick={() => currentPage >1 ? setCurrentPage(currentPage - 1): null}>
              <ArrowLeft size={20}/>
            </button>
            {
                Array.from({length: pages}, (_, i) => i + 1).map((page) => (
                    <button key={page} className={`${currentPage === page ? 'btn-primary ':' btn-secondary' } `} onClick={() => setCurrentPage(page)}>{page}</button>
                ))
            }
            <button className="btn-secondary" onClick={() => currentPage < pages ? setCurrentPage(currentPage + 1): null}>
              <ArrowRight size={20}/>
            </button>
        </div>
    </div>
  )
}

export default Pagination
