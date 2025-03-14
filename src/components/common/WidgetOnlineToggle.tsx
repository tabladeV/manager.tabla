import React, { useEffect, useState } from 'react';
import { Power, Loader2 } from 'lucide-react';
import { useUpdate, useList, BaseKey } from '@refinedev/core';
import { usePowerContext } from '../../context/PowerContext';

interface WidgetOnlineToggleProps {
  className?: string;
  showLabel?: boolean;
  size?: number;
}

const WidgetOnlineToggle: React.FC<WidgetOnlineToggleProps> = ({ 
  className = '',
  showLabel = false,
  size = 20 
}) => {
  // State management
  const [widgetData, setWidgetData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { power, setPower } = usePowerContext();
  const id = localStorage.getItem('restaurant_id');
  const isDarkMode = localStorage.getItem('darkMode') === 'true';

  // Get widget data from API
  const { data, isLoading: isDataLoading } = useList({
    resource: `api/v1/bo/restaurants/${id}/widget/`,
    errorNotification(error) {
      return {
        type: 'error',
        message: error?.formattedMessage,
      };
    }
  });

  // Update widget activation status
  const { mutate: widgetActivation, isLoading: isUpdateLoading } = useUpdate({
    resource: `api/v1/bo/restaurants`,
    errorNotification(error) {
      return {
        type: 'error',
        message: error?.formattedMessage,
      };
    },
  });

  // Update combined loading state
  useEffect(() => {
    setIsLoading(isDataLoading || isUpdateLoading);
  }, [isDataLoading, isUpdateLoading]);

  // Fetch widget data when data changes
  useEffect(() => {
    if (data?.data) {
      setWidgetData(data.data);
    }
  }, [data]);

  // Update power context when widget data changes
  useEffect(() => {
    if (widgetData) {
      setPower(widgetData.is_widget_activated);
    }
  }, [widgetData, setPower]);

  // Update widget activation status with confirmation
  const updateActivation = () => {
    if (isLoading) return; // Prevent action while loading
    
    const newStatus = !widgetData?.is_widget_activated;
    const message = newStatus 
      ? "Are you sure you want to turn the widget online?" 
      : "Are you sure you want to turn the widget offline?";
    
    // Show confirmation dialog
    if (window.confirm(message)) {
      setIsLoading(true); // Set loading state manually for immediate feedback
      
      const formData = new FormData();
      formData.append('is_widget_activated', newStatus.toString());
      
      widgetActivation(
        {
          id: `${id}/widget_partial_update/`,
          values: formData,
        },
        {
          onSuccess: () => {
            if (widgetData) {
              setWidgetData({
                ...widgetData,
                is_widget_activated: newStatus,
              });
              setPower(newStatus);
            }
          },
          onError: () => {
            // Loading state will be turned off by isUpdateLoading effect
          },
          onSettled: () => {
            // This ensures loading state is updated even if handlers above don't run
            setIsLoading(false);
          }
        }
      );
    }
  };

  // Background color based on dark mode
  const buttonBgColor = isDarkMode ? 'bg-bgdarktheme2' : 'bg-[#88AB6115]';
  
  // Create loading indicator
  const LoadingIndicator = () => (
    <Loader2 
      size={size} 
      className="animate-spin" 
    />
  );

  if (showLabel) {
    return (
      <button 
        onClick={updateActivation}
        disabled={isLoading}
        className={`flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 w-full ${isLoading ? 'opacity-70 cursor-wait' : ''} ${className}`}
      >
        {isLoading ? (
          <>
            <LoadingIndicator />
            <span className="text-gray-500">
              Updating...
            </span>
          </>
        ) : (
          <>
            <Power 
              size={size} 
              className={`mr-2 ${power ? 'text-green-500' : 'text-red-500'}`} 
            />
            <span className={power ? 'text-green-500' : 'text-red-500'}>
              Widget {power ? 'Online' : 'Offline'}
            </span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={updateActivation}
      disabled={isLoading}
      className={`${buttonBgColor} w-10 h-10 flex justify-center items-center rounded-full transition-colors duration-200 relative ${isLoading ? 'opacity-70 cursor-wait' : ''} ${className}`}
      aria-label={isLoading ? "Updating widget status" : power ? "Widget is online" : "Widget is offline"}
    >
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <>
          <Power 
            size={size} 
            className={`transition-colors duration-300 ${power ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`} 
          />
          {power ? (
            <span className="absolute w-full h-full rounded-full bg-green-400 opacity-10 animate-pulse" 
                  style={{ animationDuration: '4s' }}></span>
          ) : (
            <span className="absolute w-full h-full rounded-full bg-red-400 opacity-10 animate-pulse" 
                  style={{ animationDuration: '4s' }}></span>
          )}
        </>
      )}
    </button>
  );
};

export default WidgetOnlineToggle;