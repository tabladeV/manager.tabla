import React, { useCallback, useEffect, useRef, useState } from "react";
import { useCreate } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import Logo from "../../components/header/Logo";
import Alert from "../../components/common/Alert";
import BaseInput from "../../components/common/BaseInput";
import BaseBtn from "../../components/common/BaseBtn";
import { useDateContext } from "../../context/DateContext";

import image from "../../assets/loginImg.png"
import { Eye, EyeOff } from "lucide-react";

const LogIn: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const { setUserData } = useDateContext();

  const { mutate: login, isLoading, error } = useCreate({
    resource: "api/v1/bo/managers/login/",
    errorNotification() {
      return false;
    },
    mutationOptions: {
      onSuccess: (data, variables) => {
        if (data.data?.refresh) {
          localStorage.setItem("refresh", data.data?.refresh);
        }

        if (data.data?.access) {
          localStorage.setItem("token", data.data?.access);
        }
        
        if (data?.data.user.is_manager) {
          localStorage.setItem("is_manager", "true");
        }

        // Store user data in context
        setUserData(data.data.user);

        localStorage.setItem("isLogedIn", "true");

        navigate("/select-restaurant");
      }
    },
  });

  const [eyeOn, setEyeOn] = useState(false);
  const pswrdRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    if (localStorage.getItem("isLogedIn")) {
      navigate("/select-restaurant");
    }
  }, [navigate]);

  const isValid = useCallback(()=>{
    return !!email && !!password
  },[email, password])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(!isValid())
      return;
    login({ values: { email, password } });
  };

  return (
    <div className="flex  h-screen w-full  bg-gradient-to-tr from-[#081c15] to-darkthemeitems  p-0">
      <div className="w-1/2 flex lt-sm:w-full bg-cover overflow-hidden flex-col items-center h-screen justify-center">
        <Logo className="horizontal" />
        <h1 className="text-4xl font-bold text-center text-white">
          Welcome to Tabla.ma Admin
        </h1>
        <p className="text-center text-textdarktheme/80 font-[500] mt-2">
          Log in to your account to continue
        </p>
        {
            !!error?.response?.data && <Alert type="error" className="mb-0 mt-4">
              {error.response.data.non_field_errors || ''}
              {error.response.data.restaurant_id && <ul className="list-disc mt-4">
                <strong>
                Restaurant ID
                </strong>
                {error.response.data.restaurant_id.map((msg: string) => (<li>{msg}</li>))}
              </ul>}
              {error.response.data.email && <ul className="list-disc mt-4">
                <strong>Email</strong>
                {error.response.data.email.map((msg: string) => (<li>{msg}</li>))}
              </ul>}
              {error.response.data.password && <ul className="list-disc mt-4">
                <strong>Password</strong>
                {error.response.data.password.map((msg: string) => (<li>{msg}</li>))}
              </ul>}
            </Alert>
          }
        <form className="flex flex-col gap-2 mt-4 justify-center" onSubmit={handleSubmit}>
          <input 
            value={email} 
            type="text" 
            name="email" 
            placeholder="Email" 
            className="inputs-unique lt-md:w-[60vw] gt-md:w-[30vw]  bg-darkthemeitems text-white [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_#05291c] [&:-webkit-autofill]:[-webkit-text-fill-color:white]" 
            onChange={(e)=>setEmail(e.target.value)} 
          />          
          {/* <input value={password} type="password" name="password" placeholder="Password" className="inputs-unique lt-md:w-[60vw] gt-md:w-[30vw] bg-darkthemeitems text-white" onChange={(e)=>setPassword(e.target.value)} /> */}
          <div className={`inputs flex items-center justify-between  text-white bg-darkthemeitems`}>
            <input 
              type={eyeOn ? 'text' : 'password'} 
              name="password" 
              value={password} 
              ref={pswrdRef}  
              placeholder="Password" 
              className='w-full text-white focus:border-0  focus:ring-0 focus:outline-none bg-transparent [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_#05291c] [&:-webkit-autofill]:[-webkit-text-fill-color:white]' 
              onChange={(e)=>setPassword(e.target.value)}
            />
            <div onClick={() => setEyeOn(!eyeOn)} className={`transition-colors ${localStorage.getItem('darkMode')==='true'?'text-white':'text-[#00000080] hover:text-[#000000]'}`}>
              {eyeOn ? <EyeOff size={20}/> : <Eye size={20}/>} 
            </div>
          </div>
          <BaseBtn variant="primary" disabled={!isValid()} loading={isLoading} onClick={() => handleSubmit}>
            Login
          </BaseBtn>
        </form>
      </div>
      <div className="h-full lt-sm:hidden w-1/2 flex items-center justify-center  overflow-hidden">
          <img src={image} alt="login" className="w-full h-full bg-cover object-cover " />
        
      </div>

    </div>
  );
};

export default LogIn;
