import { BaseKey } from "@refinedev/core";
import { Bell, Layers, X } from "lucide-react";
import { memo, useEffect, useState } from "react";
import QuillPreview from "../common/QuillPreview";
import { useTranslation } from "react-i18next";
import Logo from "../header/Logo";

// #region Alert Display Component
interface Alert {
  id: BaseKey;
  title: string;
  description: string;
  image: string | null;
  is_active: boolean;
}

interface AlertCardProps {
  alert: Alert;
  onDismiss: () => void;
  onDismissAll: () => void;
  widgetLogoUrl?: string | null;
  isTopCard: boolean;
  mode: 'popup' | 'inline' | 'modal' | 'none';
}

const AlertCard: React.FC<AlertCardProps> = memo(({ alert, onDismiss, onDismissAll, widgetLogoUrl, isTopCard, mode }) => {
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const handleImageError = () => setImageError(true);
  const handleLogoError = () => setLogoError(true);

  const showPrimaryImage = alert.image && !imageError;
  const showWidgetLogo = widgetLogoUrl && !logoError && !showPrimaryImage;
  const showDefaultLogo = !showPrimaryImage && !showWidgetLogo;

  const isFixedSize = mode === 'inline';
  const cardHeightClass = isFixedSize ? 'h-full' : 'max-h-[80vh]';

  return (
    <div className={`relative bg-white dark:bg-bgdarktheme2 shadow-2xl rounded-lg overflow-hidden w-full flex flex-col ${cardHeightClass}`}>
      {isTopCard && (
        <>
          <button
            onClick={onDismissAll}
            className="absolute top-2 left-2 z-20 bg-[#88AB61] text-white p-1.5 rounded-full hover:bg-[#88AB61]/90 transition-colors flex gap-2 items-center text-sm"
            aria-label={t('common.dismissAll')}
          >
            <Layers size={16} /> <span>{t('common.dismissAll')}</span>
          </button>
          <button
            onClick={onDismiss}
            className="absolute top-2 right-2 z-20 bg-[#88AB61] text-white p-1.5 rounded-full hover:bg-[#88AB61]/90 transition-colors"
            aria-label={t('common.dismiss')}
          >
            <X size={18} />
          </button>
        </>
      )}
      <div className="relative h-40 w-full overflow-hidden bg-gray-100 dark:bg-darkthemeitems flex items-center justify-center flex-shrink-0">
        {showPrimaryImage && (
          <img src={alert.image!} alt={alert.title} onError={handleImageError} className="w-full h-full object-cover" />
        )}
        {showWidgetLogo && (
          <img src={widgetLogoUrl!} alt="Logo" onError={handleLogoError} className="h-16 w-auto object-contain" />
        )}
        {showDefaultLogo && (
          <Logo className="h-16" nolink={true} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <h3 className="absolute bottom-2 left-4 text-xl font-bold text-white drop-shadow-md">
          {alert.title}
        </h3>
      </div>
      <div className="flex-grow overflow-y-auto">
        <QuillPreview content={alert.description} />
      </div>
    </div>
  );
});

interface AlertDisplayProps {
  alerts: Alert[];
  mode: 'popup' | 'inline' | 'modal' | 'none';
  widgetLogoUrl?: string | null;
}

const AlertDisplay: React.FC<AlertDisplayProps> = ({ alerts, mode, widgetLogoUrl }) => {
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [visibleAlerts, setVisibleAlerts] = useState<Alert[]>([]);
  const [isStackVisible, setIsStackVisible] = useState(false);
  const [initialLoad, setInitialLoad] = useState(false);

  useEffect(() => {
    if (mode === 'none' || !alerts || alerts.length === 0) return;

    const filteredActive = alerts.filter(alert => alert.is_active);
    setActiveAlerts(filteredActive);
    setVisibleAlerts(filteredActive);

    const hasBeenDismissed = false;
    if (!hasBeenDismissed && filteredActive.length > 0) {
      setIsStackVisible(true);
    }
    setTimeout(() => setInitialLoad(true), 100);
  }, [alerts, mode]);

  const handleDismiss = (alertId: BaseKey) => {
    const newVisible = visibleAlerts.filter(alert => alert.id !== alertId);
    setVisibleAlerts(newVisible);
    if (newVisible.length === 0) {
      setIsStackVisible(false);
    }
  };

  const handleDismissAll = () => {
    setVisibleAlerts([]);
    setIsStackVisible(false);
  };

  const toggleStackVisibility = () => {
    if (visibleAlerts.length > 0) {
      setIsStackVisible(prev => !prev);
    } else if (activeAlerts.length > 0) {
      // If all were dismissed, toggle brings them back
      setVisibleAlerts(activeAlerts);
      setIsStackVisible(true);
    }
  };

  if (mode === 'none' || activeAlerts.length === 0) {
    return null;
  }

  const getContainerClasses = () => {
    switch (mode) {
      case 'popup':
        return 'fixed top-5 right-5 z-[60] w-[350px] max-w-[90vw]';
      case 'modal':
        return 'fixed inset-0 z-[60] flex items-center justify-center';
      case 'inline':
        return 'relative mb-6 w-full lt-sm:h-[230px] h-[250px]';
      default:
        return '';
    }
  };

  const containerClasses = getContainerClasses();
  const alertCount = activeAlerts?.length;

  const renderCards = () => {
    return visibleAlerts.map((alert, index) => {
      const isTopCard = index === visibleAlerts.length - 1;
      const cardIndex = visibleAlerts.length - 1 - index;
      const scale = Math.max(1 - cardIndex * 0.05, 0);
      const translateY = cardIndex * 12;

      const cardContainerStyle = {
        transform: `scale(${scale}) translateY(${translateY}px)`,
        zIndex: index,
        opacity: initialLoad ? 1 : 0,
      };

      return (
        <div
          key={alert.id}
          className="absolute inset-0 transition-all duration-300 ease-in-out"
          style={cardContainerStyle}
        >
          <AlertCard
            alert={alert}
            onDismiss={() => handleDismiss(alert.id)}
            onDismissAll={handleDismissAll}
            widgetLogoUrl={widgetLogoUrl}
            isTopCard={isTopCard}
            mode={mode}
          />
        </div>
      );
    });
  };

  return (
    <>
      {(mode === 'popup' || mode === 'modal') && (
        <button
          onClick={toggleStackVisibility}
          className="fixed bottom-5 right-5 z-[70] w-10 h-10 bg-[#88AB61] text-white rounded-xl shadow-lg flex items-center justify-center hover:bg-[#769c4f] transition-all duration-300"
          aria-label="Toggle alerts"
        >
          <Bell size={24} />
          {alertCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {alertCount}
            </span>
          )}
        </button>
      )}

      {mode === 'modal' && isStackVisible && (
        <div className="fixed inset-0 bg-black/50 z-[59]" onClick={handleDismissAll} />
      )}

      <div
        className={`${containerClasses} transition-all duration-500 ease-out`}
        style={{
          visibility: isStackVisible ? 'visible' : 'hidden',
          opacity: isStackVisible ? 1 : 0,
          transform: isStackVisible ? 'translateY(0)' : 'translateY(20px)',
        }}
      >
        {mode === 'modal' ? (
          <div className="relative w-[500px] max-w-[90vw] h-[500px] max-h-[80vh]">
            {renderCards()}
          </div>
        ) : (
          renderCards()
        )}
      </div>
    </>
  );
};

export default AlertDisplay;