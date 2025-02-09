import React from 'react'
import { Link } from 'react-router-dom'
import error from '../../assets/404.png'
import { ArrowLeft, Home } from 'lucide-react'

const ErrorPage = () => {
  return (
    <div className='text-center h-[100vh]  flex flex-col justify-center items-center'>
      <img src={error} alt="error" className='w-[300px] h-[300px]'/>
      <p className='text-subblack font-[500] text-[1rem]'>Oops! Page not found</p>
      <Link to='/' className='btn-primary flex items-center gap-3 mt-5'><Home size={20}/> Go back to the homepage</Link>
    </div>
  )
}

export default ErrorPage
