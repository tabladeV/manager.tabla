import React, { useEffect } from "react";
import { useCreate } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import Logo from "../../components/header/Logo";

const LogIn: React.FC = () => {
  const navigate = useNavigate();

  function handleRestaurantId(variables: any) {
    if (variables.values?.restaurant_id) {
        localStorage.setItem("restaurant_id", variables.values.restaurant_id);
    }
  }

  const { mutate: login, isLoading } = useCreate({
    resource: "api/v1/auth/login/",
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
      },
      onError: () => {
        alert("Login failed. Please check your credentials.");
      },
    },
  });

  useEffect(() => {
    if (localStorage.getItem("isLogedIn")) {
      navigate("/");
    }
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const restaurantId = formData.get("restaurant_id") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

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
      <form className="flex flex-col gap-2 mt-8" onSubmit={handleSubmit}>
        <input type="text" name="restaurant_id" placeholder="Restaurant ID" className="inputs-unique w-[30vw]" />
        <input type="text" name="email" placeholder="Email" className="inputs-unique w-[30vw]" />
        <input type="password" name="password" placeholder="Password" className="inputs-unique w-[30vw]" />
        <button className="btn-primary w-[30vw]" disabled={isLoading}>
          {isLoading ? "Logging In..." : "Log In"}
        </button>
      </form>
    </div>
  );
};

export default LogIn;
