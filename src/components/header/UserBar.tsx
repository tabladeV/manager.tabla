import { Link } from 'react-router-dom'
import profilepic from '../../assets/ProfilePic.png'
const UserBar = () => {
  return (
    <div>
     
      <div className='flex gap-3 items-center'>
        {/* <div className='absolute bottom-[-1em] flex gap-3 items-center'>
          <Link to='/dashboard' className='flex gap-3 items-center hover:bg-[#88AB6115] transition duration-200 p-[.6em] rounded-[10px]'>
            <svg className='h-[22px]' viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 2H20V20H2V2ZM2 0C1.46957 0 0.960859 0.210714 0.585786 0.585786C0.210714 0.960859 0 1.46957 0 2V20C0 20.5304 0.210714 21.0391 0.585786 21.4142C0.960859 21.7893 1.46957 22 2 22H20C20.5304 22 21.0391 21.7893 21.4142 21.4142C21.7893 21.0391 22 20.5304 22 20V2C22 1.46957 21.7893 0.960859 21.4142 0.585786C21.0391 0.210714 20.5304 0 20 0H2Z" fill="#88AB61"/>
                <path d="M7 2H15V4H7V2ZM7 6H15V8H7V6ZM7 10H15V12H7V10ZM7 14H15V16H7V14Z" fill="#88AB61"/>
            </svg>
            <h3 className=''>
              DashBoard
            </h3>
          </Link>
        </div> */}
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
    </div>
  )
}

export default UserBar
