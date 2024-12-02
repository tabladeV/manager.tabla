import { useTranslation } from 'react-i18next'
import settingsPic from '../../assets/Settings.svg'
const IndexSettings = () => {
  const { t } = useTranslation()
  return (
    <div>
      <div className='flex flex-col items-center'>
        <h2>{t('settingsPage.chooseSettingPrompt')}</h2>
        <img src={settingsPic} className='w-[30em]' alt="Settign SVG" />
      </div>
    </div>
  )
}

export default IndexSettings
