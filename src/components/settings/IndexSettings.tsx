import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const IndexSettings = () => {
  
    useEffect(() => {
      document.title = 'Settings | Tabla'
    }, [])
  const { t } = useTranslation()
  return (
    <div>
      <div className='flex flex-col items-center'>
        <h2>{t('settingsPage.chooseSettingPrompt')}</h2>
      </div>
    </div>
  )
}

export default IndexSettings
