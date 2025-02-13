import { ArrowLeft, ArrowRight } from 'lucide-react'
import React from 'react'

const Pagination = () => {
  return (
    <div>
        <div className="flex justify-center items-center gap-4">
            <button className="btn-secondary"><ArrowLeft size={20}/></button>
            <button className="btn-primary">1</button>
            <button className="btn-secondary">2</button>
            <button className="btn-secondary">3</button>
            <button className="btn-secondary"><ArrowRight size={20}/></button>
        </div>
    </div>
  )
}

export default Pagination
