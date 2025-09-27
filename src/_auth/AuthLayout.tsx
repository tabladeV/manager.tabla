import { Outlet } from 'react-router-dom'

const AuthLayout = () => {
  return (
    <div className={`flex items-center w-full h-screen justify-center`}>
      <Outlet />
    </div>
  )
}

export default AuthLayout
