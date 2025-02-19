import { useState, useRef } from 'react'
import { MessageCircleWarningIcon } from 'lucide-react';
import { useCreate } from '@refinedev/core';

const Profile = () => {
  const [error, setError] = useState('')
  const oldPswrdRef = useRef<HTMLInputElement>(null);
  const newPswrdRef = useRef<HTMLInputElement>(null);
  const confirmPswrdRef = useRef<HTMLInputElement>(null);

  const [errorMessage,setErrorMessage] = useState<string>('')
  const [successMessage,setSuccessMessage] = useState<string>('')

  const {mutate: newPassword} = useCreate({
    resource: 'api/v1/auth/password/change/',
    
    mutationOptions: {
      onSuccess: (data) => {
        setSuccessMessage('You have changed your password Successfuly')
        console.log('Reservation added:', data);

      },
      onError: (error) => {
        setErrorMessage(error.message)
        console.log('Error in changing the password:', error.message);
      },
    },
});

  const handlePasswordChange = () => {
    const oldPswrd = oldPswrdRef.current?.value;
    const newPswrd = newPswrdRef.current?.value;
    const confirmPswrd = confirmPswrdRef.current?.value;

    if (!oldPswrd || !newPswrd || !confirmPswrd) {
      setError('Please fill all fields');
      return;
    }
    if (newPswrd !== confirmPswrd) {
      setError('Passwords do not match');
      return;
    }

    console.log(oldPswrd, newPswrd, confirmPswrd);
    newPassword({
      values:{
        old_password: oldPswrd,
        new_password1: newPswrd,
        new_password2: confirmPswrd
      }
    })
  }


  const handleChange = () => {
    if (error) setError('');
  }

  return (
    <div className='h-full w-full'>
      <h1>Profile</h1>
      <div className='h-[60vh] flex flex-col  items-center justify-center'>
        <div className={`flex flex-col mx-auto h-fit items-start rounded-xl gap-2 lg:w-[30vw] shadow-xl shadow-[#00000008] p-5 ${localStorage.getItem('darkMode') === 'true' ? 'dark:bg-bgdarktheme' : 'bg-white'}`}>
          <h2 className="text-[1.6rem] font-[700]">Change your password</h2>
          <p className={`text-sm mb-4 mt-[-.5em]  ${localStorage.getItem('darkMode')==='true' ? 'text-softwhitetheme': 'text-subblack'} `}>You can change your password here</p>
          <input type="password" ref={oldPswrdRef} placeholder="Old password" className={`inputs ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems':''}`} onChange={handleChange}/>
          <input type="password" ref={newPswrdRef} placeholder="New password" className={`inputs ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems':''}`} onChange={handleChange}/>
          <input type="password" ref={confirmPswrdRef} placeholder="Confirm new password" className={`inputs ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems':''}`} onChange={handleChange}/>
          {error !=='' && <p className='text-redtheme text-sm flex gap-1 items-center'> <MessageCircleWarningIcon size={14}/> {error} {errorMessage}</p>}
          <button className="btn-primary mt-3" onClick={handlePasswordChange}>  Change password</button>
        </div>
      </div>
    </div>
  )
}

export default Profile
