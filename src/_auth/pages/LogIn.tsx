import React, { useCallback, useEffect, useRef, useState } from "react";
import { useCreate } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import Logo from "../../components/header/Logo";
import Alert from "../../components/common/Alert";
import BaseBtn from "../../components/common/BaseBtn";
import { useDateContext } from "../../context/DateContext";
import { Eye, EyeOff, CheckCircle2, ChevronRight } from 'lucide-react';
import { Capacitor } from "@capacitor/core";
import { useIOSNotchHeight } from "../../hooks/useStatusBarHeight";

import image from "../../assets/login-image2.png";
import circle from "../../assets/circle.png";

const LogIn: React.FC = () => {
  
  useEffect(() => {
    document.title = "Log In | Tabla.ma Admin";
  }
  , []);
  
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { setUserData } = useDateContext();
  const [eyeOn, setEyeOn] = useState(false);
  const pswrdRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

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
          localStorage.setItem("access", data.data?.access);
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

  useEffect(() => {
    if (localStorage.getItem("isLogedIn")) {
      navigate("/select-restaurant");
    } else if (emailRef.current) {
      // Focus email input on initial load if not logged in
      emailRef.current.focus();
    }
  }, [navigate]);

  const isValid = useCallback(() => {
    return !!email && !!password;
  }, [email, password]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValid()) return;
    login({ values: { email, password } });
  };

  // iOS-specific spacing (Android handles automatically via StatusBar plugin)
  const isIOS = Capacitor.getPlatform() === 'ios';
  const headerSpacingClass = isIOS ? 'ios-header-spacing' : '';
  const iosNotchHeight = useIOSNotchHeight();

  // Set CSS custom property for iOS dynamic spacing based on notch height
  useEffect(() => {
    if (isIOS && iosNotchHeight > 0) {
      document.documentElement.style.setProperty('--ios-notch-height', `${iosNotchHeight}px`);
    }
  }, [isIOS, iosNotchHeight]);

  return (
    <div className={`flex h-screen w-full bg-gradient-to-tr from-[#081c15] to-darkthemeitems p-4 ${headerSpacingClass}`}>
      {/* Left side - Login Form */}
      <div className="w-1/2 lt-sm:w-full flex flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          {/* Logo and Header */}
          <div className="mb-8 flex flex-col items-center">
            <Logo className="horizontal mb-6" />
            <h1 className="text-3xl sm:text-4xl font-bold text-center text-white mb-2">
              Welcome to Tabla.ma Admin
            </h1>
            <p className="text-center text-textdarktheme/80 font-medium">
              Log in to your account to continue
            </p>
          </div>

          {/* Error Alert */}
          {!!error?.response?.data && (
            <Alert type="error" className="mb-6">
              {error.response.data.non_field_errors || ""}
              {error.response.data.restaurant_id && (
                <ul className="list-disc mt-2 pl-4">
                  <strong>Restaurant ID</strong>
                  {error.response.data.restaurant_id.map((msg: string, i: number) => (
                    <li key={i}>{msg}</li>
                  ))}
                </ul>
              )}
              {error.response.data.email && (
                <ul className="list-disc mt-2 pl-4">
                  <strong>Email</strong>
                  {error.response.data.email.map((msg: string, i: number) => (
                    <li key={i}>{msg}</li>
                  ))}
                </ul>
              )}
              {error.response.data.password && (
                <ul className="list-disc mt-2 pl-4">
                  <strong>Password</strong>
                  {error.response.data.password.map((msg: string, i: number) => (
                    <li key={i}>{msg}</li>
                  ))}
                </ul>
              )}
            </Alert>
          )}

          {/* Login Form */}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-white/80 pl-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  ref={emailRef}
                  id="email"
                  value={email}
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className="inputs-unique w-full bg-darkthemeitems text-white pl-4 pr-10 py-3 rounded-lg border border-white/10 focus:border-greentheme focus:ring-1 focus:ring-greentheme [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_#05291c] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                  onChange={(e) => setEmail(e.target.value)}
                />
                {email && (
                  <CheckCircle2 
                    size={18} 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-greentheme/70" 
                  />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-white/80 pl-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  ref={pswrdRef}
                  type={eyeOn ? "text" : "password"}
                  name="password"
                  value={password}
                  placeholder="Enter your password"
                  className="inputs-unique w-full bg-darkthemeitems text-white pl-4 pr-10 py-3 rounded-lg border border-white/10 focus:border-greentheme focus:ring-1 focus:ring-greentheme [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_#05291c] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setEyeOn(!eyeOn)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                >
                  {eyeOn ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="button" className="text-sm text-greentheme hover:underline">
                Forgot password?
              </button>
            </div>

            <BaseBtn
              variant="primary"
              type="submit"
              disabled={!isValid()}
              loading={isLoading}
              className="mt-2 py-3"
            >
              {isLoading ? "Logging in..." : "Log in to your account"}
            </BaseBtn>
          </form>
        </div>
      </div>

      {/* Right side - Promotional Content */}
      <div className="h-full bg-gradient-to-tl relative from-[#0e3225] to-[#03281b] lt-sm:hidden w-1/2 flex items-center justify-center rounded-[30px] overflow-hidden">
        {/* Background elements */}
        <img src={image} alt="" className="absolute w-full h-full object-cover opacity-10" />
        <div className="absolute inset-0">
          <div className="absolute top-[20%] left-[10%] w-40 h-40 rounded-full bg-greentheme/10 blur-3xl"></div>
          <div className="absolute bottom-[30%] right-[5%] w-60 h-60 rounded-full bg-greentheme/5 blur-3xl"></div>
        </div>
        
        {/* Circle decoration - positioned for better visual impact */}
        <img 
          src={circle} 
          alt="" 
          className="w-[90%] bottom-[-20%] right-[-15%] absolute opacity-40" 
        />
        <img 
          src={circle} 
          alt="" 
          className="w-[50%] top-[-15%] left-[-10%] absolute opacity-20" 
        />
        
        {/* Content container - centered with minimal text */}
        <div className="relative z-10 max-w-md mx-auto px-10">
          {/* Simple icon */}
          <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-greentheme/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-greentheme" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3h18v18H3z"></path>
              <path d="M3 9h18"></path>
              <path d="M9 21V9"></path>
              <path d="M15 21V9"></path>
            </svg>
          </div>
          
          {/* Catchy headline */}
          <h1 className="text-5xl font-bold text-center leading-tight mb-6 text-white">
            Manage Your Restaurant <span className="text-greentheme">Effortlessly</span>
          </h1>
          
          {/* Simple tagline */}
          <p className="text-xl text-center text-white/80 mb-6">
            One platform. Complete control. Better experience.
          </p>
          
          {/* Visual divider */}
          <div className="flex items-center justify-center gap-2 my-8">
            <div className="h-1 w-1 rounded-full bg-greentheme"></div>
            <div className="h-1 w-1 rounded-full bg-greentheme"></div>
            <div className="h-1 w-10 rounded-full bg-greentheme"></div>
            <div className="h-1 w-1 rounded-full bg-greentheme"></div>
            <div className="h-1 w-1 rounded-full bg-greentheme"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogIn;