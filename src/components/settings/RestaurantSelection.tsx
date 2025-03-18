import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin } from 'lucide-react';
import Logo from "../../components/header/Logo";
import { BaseKey, useList } from "@refinedev/core";


interface RestaurantType {
    id: BaseKey;
    image: string | null;
    name: string | null;
    address: string | null;
    subdomain: string | null;
}

const RestaurantSelection: React.FC<{showLogo?: boolean}> = ({showLogo=true}) => {
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState<BaseKey | null>(null);
  const [restaurants, setRestaurents] = useState<RestaurantType[]>([]);

  const {data: apiRestaurants, error, isLoading: loading} = useList({
    resource: "api/v1/bo/restaurants/my_restaurants/",
  });
  
  useEffect(()=>{
    setRestaurents(apiRestaurants?.data as RestaurantType[] || []);
  },[apiRestaurants])

  const handleLogout = () => {
    localStorage.removeItem("isLogedIn");
    localStorage.removeItem("restaurant_id");
    localStorage.removeItem("refresh");
    localStorage.removeItem("permissions");
    document.location.href = '/sign-in';
  };

  const handleSelectRestaurant = (restaurantId: BaseKey) => {
    // Store the selected restaurant ID
    localStorage.setItem("restaurant_id", restaurantId.toString());
    
    // Navigate to the main dashboard
    navigate("/");
  };
  
  return (
    <div className="overflow-y-auto flex bg-cover flex-col items-center w-full min-h-screen">
      
      <div className="relative w-full flex items-center justify-center">
        {showLogo && <>
          <Logo className="horizontal" />
          <button className="btn-primary absolute top-[10px] left-[20px]" onClick={() => handleLogout()}>
            change user
          </button>
        </>}
      </div>
      
      <div className="max-w-5xl w-full px-4 mt-8">
        <h1 className="text-4xl font-bold text-center text-darkthemeitems dark:text-white mb-2">
          Choose a Restaurant
        </h1>
        <p className="text-center text-subblack mb-10 dark:text-gray-300">
          Select the restaurant you want to manage
        </p>
        
        <div className="flex flex-wrap gap-6 justify-center">
          {restaurants?.map((restaurant, i) => {
            const isHoveredActive = hoveredId === restaurant.id || Number(localStorage.getItem('restaurant_id') || 0) == restaurant.id;
            return (
              <div 
                key={restaurant.id+'-'+i}
                onClick={() => handleSelectRestaurant(restaurant.id)}
                onMouseEnter={() => setHoveredId(restaurant.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`size-[200px] cursor-pointer overflow-hidden rounded-lg max-w-xs transition-all duration-300 border-2 dark:border-darkthemeitems ${
                    isHoveredActive? "transform scale-105 shadow-xl" : ""
                  }`}
              >
                {/* bg-gradient-to-tr from-emerald-500 to-greentheme  */}
                <div className={`relative h-[80%] flex items-center justify-center rounded-lg transition-all duration-[900] ${
                  isHoveredActive ? "transform scale-105 btn-primary" : "btn-secondary"
                }`}>
                  <Logo/>
                  <div className={`flex items-center text-subblack rounded-lg bg-white px-2 py-0.5 top-2 right-1 absolute transition-all duration-500 text-xs ${
                    isHoveredActive ? "transform scale-105" : ""
                  }`}>
                    <MapPin size={16} className="mr-2 text-gray-500" />
                    <span>{restaurant.address}</span>
                  </div>
                </div>
                
                <div className={`p-2 transition-all duration-300 ${
                  isHoveredActive ? "transform scale-105" : ""
                }`}>
                  <h6 className="font-bold text-md truncate text-darkthemeitems dark:text-white mb-2">
                    {restaurant.name}
                  </h6>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RestaurantSelection;