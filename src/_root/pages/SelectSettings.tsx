import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const SelectSettings = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect to unified settings
    navigate('/settings', { replace: true })
  }, [navigate])

  return null
}

export default SelectSettings