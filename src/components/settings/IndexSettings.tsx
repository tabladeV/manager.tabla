import settingsPic from '../../assets/Settings.svg'
const IndexSettings = () => {
  return (
    <div>
      <div className='flex flex-col items-center'>
        <h2>Choose a setting to modify</h2>
        <img src={settingsPic} className='w-[30em]' alt="Settign SVG" />
      </div>
    </div>
  )
}

export default IndexSettings
