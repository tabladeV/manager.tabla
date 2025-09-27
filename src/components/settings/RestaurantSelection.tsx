import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin } from 'lucide-react';
import Logo from "../../components/header/Logo";
import { BaseKey, useList } from "@refinedev/core";
import authProvider from "../../providers/authProvider";
import { useDateContext } from "../../context/DateContext";
import { useTranslation } from "react-i18next";
import { Capacitor } from "@capacitor/core";
import { useIOSNotchHeight } from "../../hooks/useStatusBarHeight";

interface RestaurantType {
    id: BaseKey;
    image: string | null;
    name: string | null;
    address: string | null;
    subdomain: string | null;
}

interface IdentityType {is_manager: boolean, permissions: string[]}

const RestaurantSelection: React.FC<{showLogo?: boolean}> = ({showLogo=true}) => {
  
  useEffect(() => {
    document.title = "Restaurant Selection";
  }, []);

  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState<BaseKey | null>(null);
  const [restaurants, setRestaurents] = useState<RestaurantType[]>([]);
  const { setRestaurantData } = useDateContext();

  const {data: apiRestaurants, error, isLoading: loading} = useList({
    resource: "api/v1/bo/restaurants/my_restaurants/",
  });

  
  useEffect(()=>{
    const uniqueRestaurants = (apiRestaurants?.data as RestaurantType[] || []).filter(
      (restaurant, index, self) => index === self.findIndex(t => t.id === restaurant.id)
    );
    setRestaurents(uniqueRestaurants);
  },[apiRestaurants])

  // Logout handler
  const handleLogout = () => {
    authProvider.logout({});
  };

  const handleSelectRestaurant = async (restaurantId: BaseKey) => {
    // Store the selected restaurant ID
    localStorage.setItem("restaurant_id", restaurantId.toString());
    
    // Find the selected restaurant from the list
    const selectedRestaurant = restaurants.find(restaurant => restaurant.id === restaurantId);
    
    // Store restaurant data in context if found
    if (selectedRestaurant) {
      setRestaurantData(selectedRestaurant as any);
    }
    
    try {
      if (authProvider && authProvider.getIdentity) {
        const res = await authProvider.getIdentity() as IdentityType;
        if(res?.is_manager || res?.permissions?.includes('view_dashboard')) {
          navigate("/");
        }else {
          navigate("/change-restaurant");
        }

        setTimeout(()=>{
          window.location.reload();
        });
      }
    }catch (e) {
      localStorage.removeItem("restaurant_id");
      console.log(e);
    }
  };

  const { t } = useTranslation();

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

  const buttonTopPos = isIOS ? `${iosNotchHeight + 56}px` : '70px';

  return (
    <div className="flex bg-cover flex-col items-center w-full min-h-screen max-h-screen overflow-y-auto dark:bg-bgdarktheme">

      <div className={`relative w-full flex items-center justify-center ${headerSpacingClass}`}>
        {showLogo && <>
          <Logo className="horizontal" nolink />
          <button className="btn-primary fixed z-10" style={{top: buttonTopPos, left: '16px'}} onClick={() => handleLogout()}>
            {t('restaurantSelection.changeUser') || "Change User"}
          </button>
        </>}
      </div>
      
      <div className="max-w-5xl w-full px-4 mt-8">
        <h1 className="text-4xl font-bold text-center text-darkthemeitems dark:text-white mb-2">
          {t('restaurantSelection.title') || "Select a Restaurant"}
        </h1>
        <p className="text-center text-subblack mb-10 dark:text-gray-300">
          {t('restaurantSelection.description') || "Select the restaurant you want to manage."}
        </p>
        
        <div className="flex flex-wrap gap-6 justify-center">
          {restaurants?.map((restaurant, i) => {
            const isHoveredActive = hoveredId === restaurant.id+'-'+i || Number(localStorage.getItem('restaurant_id') || 0) == restaurant.id;
            return (
              <div 
                key={restaurant.id+'-'+i}
                onClick={() => handleSelectRestaurant(restaurant.id)}
                onMouseEnter={() => setHoveredId(restaurant.id+'-'+i)}
                onMouseLeave={() => setHoveredId(null)}
                className={`size-[200px] cursor-pointer overflow-hidden rounded-lg max-w-xs transition-all duration-300 border-1 dark:bg-bgdarktheme2 dark:border-darkthemeitems ${
                    isHoveredActive? "transform scale-105 shadow-xl" : ""
                  }`}
              >
                {/* bg-gradient-to-tr from-emerald-500 to-greentheme  */}
                <div className={`relative h-[80%] flex items-center justify-center rounded-lg transition-all duration-[900] ${
                  isHoveredActive ? "transform scale-105 btn-primary" : "btn-secondary"
                }`}>
                  <Logo nolink/>
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
