import React from 'react'
import { Link } from 'react-router-dom'

const ErrorPage = () => {
  return (
    <div className='text-center h-[100vh]  flex flex-col justify-center items-center'>
      <Link to='/' className='btn-primary'>Go back to the homepage</Link>
    </div>
  )
}

export default ErrorPage
