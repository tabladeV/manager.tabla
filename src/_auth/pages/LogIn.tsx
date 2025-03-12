import React, { useCallback, useEffect, useState } from "react";
import { useCreate } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import Logo from "../../components/header/Logo";
import Alert from "../../components/common/Alert";
import BaseInput from "../../components/common/BaseInput";
import BaseBtn from "../../components/common/BaseBtn";

const LogIn: React.FC = () => {
  const navigate = useNavigate();
  const [restaurantId, setRestaurantId] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  function handleRestaurantId(variables: any) {
    if (variables.values?.restaurant_id) {
        localStorage.setItem("restaurant_id", variables.values.restaurant_id);
    }
  }

  const { mutate: login, isLoading, error } = useCreate({
    resource: "api/v1/auth/login/",
    errorNotification() {
      return false;
    },
    mutationOptions: {
      onSuccess: (data, variables) => {
        const refreshToken = data.data?.refresh;
        if (refreshToken) {
          localStorage.setItem("refresh", refreshToken);
        }

        if (data?.data.user.permissions) {
          localStorage.setItem("permissions", JSON.stringify(data?.data.user.permissions));
        }
        
        if (data?.data.user.is_manager) {
          localStorage.setItem("is_manager", "true");
        }

        handleRestaurantId(variables);

        localStorage.setItem("isLogedIn", "true");

        navigate("/");
      }
    },
  });

  useEffect(() => {
    if (localStorage.getItem("isLogedIn")) {
      navigate("/");
    }
  }, [navigate]);

  const isValid = useCallback(()=>{
    return !!restaurantId && !!email && !!password
  },[restaurantId, email, password])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(!isValid())
      return;
    login({ values: { restaurant_id: Number(restaurantId), email, password } });
  };

  return (
    <div className="flex bg-cover overflow-hidden flex-col items-center w-full h-screen justify-center bg-softgreentheme">
      <Logo className="horizontal" />
      <h1 className="text-4xl font-bold text-center text-darkthemeitems">
        Welcome to Tabla.ma Admin
      </h1>
      <p className="text-center text-subblack">
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
        <input value={restaurantId} type="text" name="restaurant_id" placeholder="Restaurant ID" className="inputs-unique lt-md:w-[60vw] gt-md:w-[30vw]" onChange={(e)=>setRestaurantId(e.target.value)} />
        <input value={email} type="text" name="email" placeholder="Email" className="inputs-unique lt-md:w-[60vw] gt-md:w-[30vw]" onChange={(e)=>setEmail(e.target.value)} />
        <input value={password} type="password" name="password" placeholder="Password" className="inputs-unique lt-md:w-[60vw] gt-md:w-[30vw]" onChange={(e)=>setPassword(e.target.value)} />
        <BaseBtn variant="primary" disabled={!isValid()} loading={isLoading} onClick={() => handleSubmit}>
          Login
        </BaseBtn>
      </form>
    </div>
  );
};

export default LogIn;
