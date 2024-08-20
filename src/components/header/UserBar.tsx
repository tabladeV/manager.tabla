import profilepic from '../../assets/ProfilePic.png'
const UserBar = () => {
  return (
    <div className='flex gap-3 items-center'>
      <button className='bg-[#88AB6115] w-[40px] h-[40px] flex justify-center items-center rounded-[100%]'> 
        <svg className='h-[22px]' viewBox="0 0 18 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.645 19.5C5.86103 20.2219 6.30417 20.8549 6.90858 21.3049C7.513 21.755 8.24645 21.998 9 21.998C9.75355 21.998 10.487 21.755 11.0914 21.3049C11.6958 20.8549 12.139 20.2219 12.355 19.5H5.645ZM0 18.5H18V15.5L16 12.5V7.5C16 6.58075 15.8189 5.6705 15.4672 4.82122C15.1154 3.97194 14.5998 3.20026 13.9497 2.55025C13.2997 1.90024 12.5281 1.38463 11.6788 1.03284C10.8295 0.68106 9.91925 0.5 9 0.5C8.08075 0.5 7.17049 0.68106 6.32122 1.03284C5.47194 1.38463 4.70026 1.90024 4.05025 2.55025C3.40024 3.20026 2.88463 3.97194 2.53284 4.82122C2.18106 5.6705 2 6.58075 2 7.5V12.5L0 15.5V18.5Z" fill="#88AB61"/>
        </svg>

      </button>
      <button className='flex items-center gap-2 hover:bg-[#88AB6115] transition duration-200 p-[.6em] rounded-[10px]'>
        <img className='h-[40px] w-[40px] rounded-[100%]' src={profilepic} alt="user"/>
        <h5 className='text-greytheme font-semibold '>Alfred Distivano</h5>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 1L5 5L1 1" stroke="#1E1E1E" stroke-opacity="0.75" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  )
}

export default UserBar
