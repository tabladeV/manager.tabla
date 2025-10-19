import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, ChevronRight, LogOut, Store } from 'lucide-react';
import Logo from "../../components/header/Logo";
import LogoIcon from "../../assets/LOGO.png";
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

interface IdentityType {
    is_manager: boolean;
    permissions: string[];
}

const RestaurantSelection: React.FC<{ showLogo?: boolean }> = ({ showLogo = true }) => {
  
  useEffect(() => {
    document.title = "Restaurant Selection";
  }, []);

  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<BaseKey | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [restaurants, setRestaurants] = useState<RestaurantType[]>([]);
  const { setRestaurantData } = useDateContext();
  const { t } = useTranslation();

  const { data: apiRestaurants, error, isLoading: loading } = useList({
    resource: "api/v1/bo/restaurants/my_restaurants/",
  });

  useEffect(() => {
    const uniqueRestaurants = (apiRestaurants?.data as RestaurantType[] || []).filter(
      (restaurant, index, self) => index === self.findIndex(t => t.id === restaurant.id)
    );
    setRestaurants(uniqueRestaurants);
  }, [apiRestaurants])

  // Logout handler
  const handleLogout = () => {
    authProvider.logout({});
  };

  const handleSelectRestaurant = async (restaurantId: BaseKey) => {
    setSelectedId(restaurantId);

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
        if (res?.is_manager || res?.permissions?.includes('view_dashboard')) {
          navigate("/");
        } else {
          navigate("/change-restaurant");
        }

        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    } catch (e) {
      localStorage.removeItem("restaurant_id");
      setSelectedId(null);
    }
  };

  // iOS-specific spacing
  const isIOS = Capacitor.getPlatform() === 'ios';
  const iosNotchHeight = useIOSNotchHeight();

  // Set CSS custom property for iOS dynamic spacing based on notch height
  useEffect(() => {
    if (isIOS && iosNotchHeight > 0) {
      document.documentElement.style.setProperty('--ios-notch-height', `${iosNotchHeight}px`);
    }
  }, [isIOS, iosNotchHeight]);

  // Skeleton Loading Component
  const SkeletonCard = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm animate-pulse">
      <div className="h-48 bg-gray-200 dark:bg-gray-700" />
      <div className="p-6">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md mb-3 w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-full" />
      </div>
    </div>
  );

  // Empty State Component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <Store className="w-24 h-24 text-gray-300 dark:text-gray-600 mb-6" />
      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
        {t('restaurantSelection.noRestaurants') || "No restaurants available"}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
        {t('restaurantSelection.contactSupport') || "Please contact support if you believe this is an error"}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      {showLogo && (
        <div className={`sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 ${isIOS ? 'pt-[var(--ios-notch-height)]' : ''}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 sm:h-20">
              <Logo className="horizontal h-8 sm:h-10" nolink />

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-softgreentheme hover:bg-greentheme/20 dark:bg-darkthemeitems dark:hover:bg-greentheme/30 text-greentheme dark:text-greentheme rounded-lg transition-colors duration-200 text-sm sm:text-base font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {t('restaurantSelection.changeUser') || "Change User"}
                </span>
                <span className="sm:hidden">
                  {t('restaurantSelection.logout') || "Logout"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 overflow-auto max-h-[100vh]">
        {/* Title Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3">
            {t('restaurantSelection.title') || "Choose a Restaurant"}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('restaurantSelection.description') || "Select the restaurant you want to manage"}
          </p>
        </div>

        {/* Restaurant Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {restaurants.map((restaurant, i) => {
              const isSelected = selectedId === restaurant.id;
              const isActive = Number(localStorage.getItem('restaurant_id') || 0) == restaurant.id;

              return (
                <button
                  key={`${restaurant.id}-${i}`}
                  onClick={() => handleSelectRestaurant(restaurant.id)}
                  disabled={isSelected}
                  className={`
                    relative group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden
                    shadow-sm hover:shadow-xl transition-all duration-300 text-left
                    ${isActive ? 'ring-2 ring-greentheme' : ''}
                    ${isSelected ? 'opacity-75 cursor-wait' : 'hover:-translate-y-1'}
                  `}
                >
                  {/* Restaurant Image or Placeholder */}
                  <div className={`relative h-40 sm:h-48 transition-all duration-300 ${
                    isSelected || hoveredId === `${restaurant.id}-${i}`
                      ? 'bg-gradient-to-br from-greentheme to-[#688F3D] dark:from-[#688F3D] dark:to-darkthemeitems'
                      : 'bg-gradient-to-br from-softgreentheme to-greentheme/30 dark:from-darkthemeitems dark:to-bgdarktheme2'
                  }`}
                    onMouseEnter={() => setHoveredId(`${restaurant.id}-${i}`)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    {restaurant.image ? (
                      <img
                        src={restaurant.image}
                        alt={restaurant.name || ''}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <img
                          src={LogoIcon}
                          alt="Tabla Logo"
                          className="h-16 w-16 sm:h-20 sm:w-20 object-contain"
                        />
                      </div>
                    )}

                    {/* Active Badge */}
                    {isActive && (
                      <div className="absolute top-3 right-3 bg-greentheme text-white px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                        {t('restaurantSelection.current') || "Current"}
                      </div>
                    )}
                  </div>

                  {/* Restaurant Info */}
                  <div className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
                      {restaurant.name || 'Unnamed Restaurant'}
                    </h3>

                    {restaurant.address && (
                      <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400 mb-4">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span className="text-sm line-clamp-2">
                          {restaurant.address}
                        </span>
                      </div>
                    )}

                    {/* Action */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-greentheme dark:text-greentheme group-hover:underline">
                        {isSelected ?
                          t('restaurantSelection.loading') || "Loading..." :
                          t('restaurantSelection.select') || "Select"}
                      </span>
                      <ChevronRight className={`
                        w-5 h-5 text-greentheme dark:text-greentheme
                        transition-transform duration-200
                        ${isSelected ? 'animate-pulse' : 'group-hover:translate-x-1'}
                      `} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantSelection;
