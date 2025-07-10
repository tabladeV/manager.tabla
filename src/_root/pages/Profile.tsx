import { useState, useRef, useEffect } from 'react'
import { Eye, EyeOff, MessageCircleWarningIcon } from 'lucide-react';
import { useCreate } from '@refinedev/core';
import { useTranslation } from 'react-i18next';

const Profile = () => {

  useEffect(() => {
    document.title = 'Profile | Tabla'
  }, [])

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
    if (newPswrd.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if(newPswrd === oldPswrd){
      setError('New password must be different from old password')
      return;
    }
    if(newPswrd.includes(' ')){
      setError('Password cannot contain spaces')
      return;
    }
    if(newPswrd.includes('password')){
      setError('Password cannot contain the word "password"')
      return;
    }
    if(!(newPswrd.includes('%')|| newPswrd.includes('&')|| newPswrd.includes('#')|| newPswrd.includes('@')|| newPswrd.includes('!'))){
      setError('Password must contain at least one special character')
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

  const [eyeOldPswrd, setEyeOldPswrd] = useState(false);  
  const [eyeNewPswrd, setEyeNewPswrd] = useState(false);
  const [eyeConfirmPswrd, setEyeConfirmPswrd] = useState(false);


  const handleChange = () => {
    if (error) setError('');
  }

  const { t } = useTranslation()
  

  return (
    <div className='h-full w-full'>
      <h1>{t('profile.title', 'Profile')}</h1>
      <div className='h-[60vh] flex flex-col  items-center justify-center'>
        <div className={`flex flex-col mx-auto h-fit items-start rounded-xl gap-2 lg:w-[30vw] lt-sm:w-full shadow-xl shadow-[#00000008] p-5 dark:bg-bgdarktheme bg-white `}>
          <h2 className="text-[1.6rem] font-[700]">{t('profile.changePassword', 'Change Password')}</h2>
          <p className={`text-sm mb-4 mt-[-.5em]  dark:text-softwhitetheme text-subblack  `}>{t('profile.changePasswordDescription', 'Change your password to keep your account secure.')}</p>
          <div className={`inputs flex justify-between dark:bg-darkthemeitems `}>
            <input type={eyeOldPswrd ? 'text' : 'password'}  ref={oldPswrdRef} placeholder={t('profile.currentPassword')}  onChange={handleChange} className='w-full focus:border-0 focus:ring-0 focus:outline-none bg-transparent'/>
            <button onClick={() => setEyeOldPswrd(!eyeOldPswrd)} className={ ` transition-colors dark:text-white text-[#00000080] hover:text-[#000000] `}>
              {eyeOldPswrd ? <EyeOff size={20}/> : <Eye size={20}/>} 
            </button>
          </div>  
          <div className={`inputs flex justify-between dark:bg-darkthemeitems `}>
            <input type={eyeNewPswrd ? 'text' : 'password'}  ref={newPswrdRef} placeholder={t('profile.newPassword')}  onChange={handleChange} className='w-full focus:border-0 focus:ring-0 focus:outline-none bg-transparent'/>
            <button onClick={() => setEyeNewPswrd(!eyeNewPswrd)} className={ ` transition-colors dark:text-white text-[#00000080] hover:text-[#000000] `}>
              {eyeNewPswrd ? <EyeOff size={20}/> : <Eye size={20}/>} 
            </button>
          </div>
          <div className={`inputs flex justify-between dark:bg-darkthemeitems `}>
            <input type={eyeConfirmPswrd ? 'text' : 'password'}  ref={confirmPswrdRef} placeholder={t('profile.confirmNewPassword')}  onChange={handleChange} className='w-full focus:border-0 focus:ring-0 focus:outline-none bg-transparent'/>
            <button onClick={() => setEyeConfirmPswrd(!eyeConfirmPswrd)} className={ ` transition-colors dark:text-white text-[#00000080] hover:text-[#000000] `}>
              {eyeConfirmPswrd ? <EyeOff size={20}/> : <Eye size={20}/>} 
            </button>
          </div>
          {error !=='' && <p className='text-redtheme text-sm flex gap-1 items-center'> <MessageCircleWarningIcon size={14}/> {error} {errorMessage}</p>}
          <button className="btn-primary mt-3" onClick={handlePasswordChange}>{t('profile.saveChanges')}</button>
        </div>
      </div>
    </div>
  )
}

export default Profile
