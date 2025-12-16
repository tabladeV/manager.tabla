import { BaseKey } from "@refinedev/core";
import { Bell, Layers, X, Calendar, Clock, ArrowRight, ChevronLeft, ChevronRight, Info, ChevronDown, ChevronUp, Eye } from "lucide-react";
import { memo, useEffect, useState, useRef, useMemo } from "react";
import QuillPreview from "../common/QuillPreview";
import { useTranslation } from "react-i18next";
import Logo from "../header/Logo";
import { format, parseISO } from "date-fns";
import Portal from "../common/Portal";

// #region Types
export interface Alert {
  id: BaseKey;
  title: string;
  description: string;
  image: string | null;
  is_active: boolean;
  event_start_date?: string;
  event_end_date?: string;
  event_start_time?: string;
  event_end_time?: string;
}

interface AlertDisplayProps {
  alerts: Alert[];
  mode: 'popup' | 'inline' | 'modal' | 'none';
  widgetLogoUrl?: string | null;
  onBookNow: (alert: Alert) => void;
}
// #endregion

// #region Detail Modal
const EventDetailModal = ({ alert, onClose, onBookNow, widgetLogoUrl }: { alert: Alert, onClose: () => void, onBookNow: (alert: Alert) => void, widgetLogoUrl?: string | null }) => {
  const { t } = useTranslation();

  const formatDateRange = () => {
    if (!alert.event_start_date) return null;
    const start = format(parseISO(alert.event_start_date), 'MMM dd, yyyy');
    if (!alert.event_end_date || alert.event_start_date === alert.event_end_date) {
      return start;
    }
    const end = format(parseISO(alert.event_end_date), 'MMM dd, yyyy');
    return `${start} - ${end}`;
  };

  const formatTimeRange = () => {
    if (!alert.event_start_time) return null;
    const start = alert.event_start_time.slice(0, 5);
    if (!alert.event_end_time) return start;
    const end = alert.event_end_time.slice(0, 5);
    return `${start} - ${end}`;
  };

  return (
    <Portal targetId="root">
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white dark:bg-bgdarktheme2 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <div className="relative h-48 sm:h-64 bg-gray-100 dark:bg-darkthemeitems shrink-0">
            {alert.image ? (
              <img src={alert.image} alt={alert.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {widgetLogoUrl ? <img src={widgetLogoUrl} className="h-20 object-contain" alt="Logo" /> : <Logo className="h-16" nolink={true} />}
              </div>
            )}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <h2 className="text-xl font-bold text-white">{alert.title}</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                {formatDateRange() && (
                  <div className="flex items-center gap-1 text-xs font-medium text-white bg-white/20 backdrop-blur-md px-2 py-1 rounded">
                    <Calendar size={12} />
                    <span>{formatDateRange()}</span>
                  </div>
                )}
                {formatTimeRange() && (
                  <div className="flex items-center gap-1 text-xs font-medium text-white bg-white/20 backdrop-blur-md px-2 py-1 rounded">
                    <Clock size={12} />
                    <span>{formatTimeRange()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {alert.description?.length > 2 && (<div className="overflow-y-auto max-h-[40vh] flex-1 text-[#333333] dark:text-[#e1e1e1]">
            <QuillPreview content={alert.description} className="p-2" />
          </div>)}

          <div className="p-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-darkthemeitems/50 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="btn-danger-outline rounded-lg transition-colors"
            >
              {t('common.close')}
            </button>
            <button
              onClick={() => { onBookNow(alert); onClose(); }}
              className="px-2 py-2 text-sm font-bold text-white bg-[#88AB61] hover:bg-[#769c4f] rounded-lg shadow-md transition-colors flex items-center gap-2"
            >
              <span>{t('reservationWidget.reservation.bookNow')}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
};
// #endregion

// #region Carousel Card
const CarouselCard = memo(({ alert, offset, absOffset, direction, active, onReadMore, onBookNow, widgetLogoUrl }: {
  alert: Alert,
  offset: number,
  absOffset: number,
  direction: number,
  active: boolean,
  onReadMore: () => void,
  onBookNow: () => void,
  widgetLogoUrl?: string | null
}) => {
  const { t } = useTranslation();

  // 3D Transform Logic
  const style: React.CSSProperties = {
    transform: `rotateY(${offset * 50}deg) scaleY(${1 + absOffset * -0.4}) translateZ(${absOffset * -30}rem) translateX(${direction * -5}rem)`,
    filter: `blur(${absOffset * 1}rem)`,
    opacity: Math.abs(offset * 3) >= 3 ? 0 : 1,
    display: Math.abs(offset * 3) > 3 ? 'none' : 'block',
    zIndex: active ? 10 : 1,
    pointerEvents: active ? 'auto' : 'none',
    transition: 'all 0.3s ease-out',
    position: 'absolute',
    width: '100%',
    top: 0,
    left: 0,
  };

  const hasEventData = alert.event_start_date || alert.event_end_date;
  const hasTimeData = alert.event_start_time || alert.event_end_time;

  return (
    <div style={style} className="card-container">
      <div className="w-full h-full bg-white dark:bg-darkthemeitems rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col">
        {/* Image Section */}
        <div className="relative h-40 bg-gray-100 dark:bg-gray-800 shrink-0">
          {alert.image ? (
            <img src={alert.image} alt={alert.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center opacity-50">
              {widgetLogoUrl ? <img src={widgetLogoUrl} className="h-12 object-contain" alt="Logo" /> : <Logo className="h-10" nolink={true} />}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

          {/* Badges */}
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-white font-bold text-lg leading-tight line-clamp-2 mb-1">{alert.title}</h3>
            <div className="flex flex-col gap-1">
              {hasEventData && (
                <div className="flex items-center gap-2 text-[10px] text-white/90 font-medium">
                  <Calendar size={12} className="text-[#88AB61]" />
                  <span>
                    {alert.event_start_date ? format(parseISO(alert.event_start_date), 'MMM dd') : ''}
                    {alert.event_end_date && alert.event_end_date !== alert.event_start_date ? ` - ${format(parseISO(alert.event_end_date), 'MMM dd')}` : ''}
                  </span>
                </div>
              )}
              {hasTimeData && (
                <div className="flex items-center gap-2 text-[10px] text-white/90 font-medium">
                  <Clock size={12} className="text-[#88AB61]" />
                  <span>
                    {alert.event_start_time ? alert.event_start_time.slice(0, 5) : ''}
                    {alert.event_end_time ? ` - ${alert.event_end_time.slice(0, 5)}` : ''}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-1 flex flex-col justify-end bg-white dark:bg-darkthemeitems">
          <div className={`flex items-center ${alert.description?.length > 2 ? 'justify-between' : 'justify-end'} gap-2 mt-auto`}>
            {alert.description?.length > 2 && (<button
              onClick={(e) => { e.stopPropagation(); onReadMore(); }}
              className="text-xs font-semibold text-gray-500 dark:text-gray-300 hover:text-[#88AB61] dark:hover:text-[#88AB61] flex items-center gap-1 transition-colors px-2 py-1.5"
            >
              <Info size={14} />
              {t('reservationWidget.common.readMore', 'Read More')}
            </button>)}

            <button
              onClick={(e) => { e.stopPropagation(); onBookNow(); }}
              className="text-xs font-bold text-white bg-[#88AB61] hover:bg-[#769c4f] px-2 py-2 rounded-full shadow-md transition-all flex items-center gap-1.5"
            >
              {t('reservationWidget.reservation.bookNow')}
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
// #endregion

// #region Main Component
const AlertDisplay: React.FC<AlertDisplayProps> = ({ alerts, mode, widgetLogoUrl, onBookNow }) => {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false); // Default expanded for inline
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  useEffect(() => {
    if (!alerts) return;
    const filtered = alerts.filter(a => a.is_active);
    setActiveAlerts(filtered);
    // Center the active card initially if possible, or start at 0
    setActive(alerts?.length > 1 ? Math.floor(alerts?.length / 2) : 0);
  }, [alerts]);

  const handleNext = () => {
    if (active < activeAlerts.length - 1) setActive(prev => prev + 1);
  };

  const handlePrev = () => {
    if (active > 0) setActive(prev => prev - 1);
  };

  const MAX_VISIBILITY = 3;

  const renderCarousel = () => (
    <div className="relative w-full max-w-[70%] lt-md:max-w-[100%] h-[250px] mx-auto perspective-500" style={{ perspective: '500px', transformStyle: 'preserve-3d' }}>
      {active > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); handlePrev(); }}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 bg-white/80 dark:bg-black/50 p-2 rounded-full shadow-lg hover:bg-white dark:hover:bg-black/70 transition-all text-gray-700 dark:text-white"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {activeAlerts.map((alert, i) => (
        <CarouselCard
          key={alert.id}
          alert={alert}
          active={i === active}
          offset={(active - i) / 3}
          absOffset={Math.abs(active - i) / 3}
          direction={Math.sign(active - i)}
          onReadMore={() => setSelectedAlert(alert)}
          onBookNow={() => onBookNow(alert)}
          widgetLogoUrl={widgetLogoUrl}
        />
      ))}

      {active < activeAlerts.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); handleNext(); }}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 bg-white/80 dark:bg-black/50 p-2 rounded-full shadow-lg hover:bg-white dark:hover:bg-black/70 transition-all text-gray-700 dark:text-white"
        >
          <ChevronRight size={24} />
        </button>
      )}
    </div>
  );

  if (!activeAlerts.length) return null;

  // Inline Mode
  if (mode === 'inline') {
    return (
      <div className="w-full">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full mb-2 flex items-center justify-between p-4 bg-white dark:bg-darkthemeitems rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors hover:bg-gray-50 dark:hover:bg-bgdarktheme2"
        >
          <div className="flex items-center gap-2">
            <div className="bg-[#88AB61]/10 p-2 rounded-lg">
              <Calendar className="text-[#88AB61]" size={20} />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-gray-800 dark:text-white text-sm">{t('reservationWidget.events.title', 'Events & Offers')}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{activeAlerts.length} {t('reservationWidget.events.available', 'available')}</p>
            </div>
          </div>
          {isCollapsed ? <ChevronDown size={20} className="text-gray-400" /> : <ChevronUp size={20} className="text-gray-400" />}
        </button>

        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isCollapsed ? 'max-h-0 opacity-0' : 'opacity-100'}`}>
          <div className="py-2 px-2">
            {renderCarousel()}
          </div>
        </div>

        {selectedAlert && (
          <EventDetailModal
            alert={selectedAlert}
            onClose={() => setSelectedAlert(null)}
            onBookNow={onBookNow}
            widgetLogoUrl={widgetLogoUrl}
          />
        )}
      </div>
    );
  }

  // Popup / Modal Mode
  return (
    <>
      <Portal targetId="root">
        <button
          onClick={() => setIsPopupOpen(true)}
          className="fixed bottom-5 right-5 z-[40] w-12 h-12 bg-[#88AB61] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#769c4f] transition-all duration-300 hover:scale-110"
          aria-label="Toggle alerts"
        >
          <Bell size={24} />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white dark:border-bgdarktheme2">
            {activeAlerts.length}
          </span>
        </button>
      </Portal>

      {isPopupOpen && (
        <Portal targetId="root">
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn" onClick={() => setIsPopupOpen(false)}>
            <div className="relative w-full max-w-md" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setIsPopupOpen(false)}
                className="absolute -top-12 right-0 text-white hover:text-gray-200 transition-colors"
              >
                <X size={32} />
              </button>
              {renderCarousel()}
            </div>
          </div>
        </Portal>
      )}

      {selectedAlert && (
        <EventDetailModal
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onBookNow={(alert) => {
            onBookNow(alert);
            setIsPopupOpen(false);
          }}
          widgetLogoUrl={widgetLogoUrl}
        />
      )}
    </>
  );
};

export default AlertDisplay;