import React from 'react'
import { Outlet } from 'react-router-dom'
import GoogleAnalytics from '../components/common/GoogleAnalytics'

const Plugins = () => {
  return (
    <div>
      <GoogleAnalytics/>
      <Outlet />
    </div>
  )
}

export default Plugins
