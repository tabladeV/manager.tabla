import React, { memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Phone, Mail, Globe, Facebook, Instagram, Twitter, Linkedin, MessageCircle, Link as LinkIcon, MapPinned } from 'lucide-react';
import visaLogo from "../../assets/VISA.jpg";
import masterCardLogo from "../../assets/MasterCard.jpg";
import cmiLogo from "../../assets/CMI.jpg";
import QuillPreview from '../common/QuillPreview';

// Configuration for contact types
const CONTACT_CONFIG: Record<string, { icon: any, color?: string, prefix?: string }> = {
    PHONE: { icon: Phone, prefix: 'tel:' },
    WHATSAPP: { icon: MessageCircle, color: '#25D366', prefix: 'https://wa.me/' },
    EMAIL: { icon: Mail, prefix: 'mailto:' },
    WEBSITE: { icon: Globe, prefix: '' },
    TWITTER: { icon: Twitter, color: '#1DA1F2', prefix: '' },
    INSTAGRAM: { icon: Instagram, color: '#E1306C', prefix: '' },
    FACEBOOK: { icon: Facebook, color: '#1877F2', prefix: '' },
    LINKEDIN: { icon: Linkedin, color: '#0A66C2', prefix: '' },
    TIKTOK: { icon: LinkIcon, color: '#FE2C55', prefix: '' },
    TRIP_ADVISOR: { icon: LinkIcon, color: '#00AF87', prefix: '' },
    GOOGLE_MAPS: { icon: MapPinned, color: '#4285F4', prefix: '' },
};

export const SharedWidgetFooter = memo(({ widgetInfo, isPaymentRequired, showDescription = false }: { widgetInfo: any, isPaymentRequired: boolean, showDescription?: boolean }) => {
    const { t } = useTranslation();
    const restaurant = widgetInfo?.restaurant;
    const contactDetails = widgetInfo?.contact_details || [];

    const getHref = (type: string, value: string) => {
        const config = CONTACT_CONFIG[type];
        if (!config) return value;
        
        if (type === 'WHATSAPP') {
             return `${config.prefix}${value.replace(/[^0-9]/g, '')}`;
        }
        
        // For website/socials, ensure https:// if missing
        if (['WEBSITE', 'TWITTER', 'INSTAGRAM', 'FACEBOOK', 'LINKEDIN', 'TIKTOK', 'TRIP_ADVISOR', 'GOOGLE_MAPS'].includes(type)) {
            if (!value.startsWith('http')) {
                return `https://${value}`;
            }
        }

        return `${config.prefix || ''}${value}`;
    };

    return (
        <div className="w-full flex flex-col flex-grow-1">
            <div className="px-6 pb-6">
                {(contactDetails.length > 0 || restaurant?.phone || restaurant?.email || restaurant?.website) && (
                    <div className="border-t border-[#dddddd] dark:border-[#444444] pt-4">
                        <h3 className="text-lg font-medium mb-4 text-center text-[#333333] dark:text-[#e1e1e1]">{t("reservationWidget.contact.followUs")}</h3>
                        <div className="flex justify-center items-center gap-3 flex-wrap">
                            {/* Dynamic Contact Details */}
                            {contactDetails.map((contact: any, index: number) => {
                                const config = CONTACT_CONFIG[contact.type] || { icon: LinkIcon };
                                const Icon = config.icon;
                                
                                return (
                                    <a 
                                        key={index}
                                        href={getHref(contact.type, contact.value)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 p-2.5 rounded-lg bg-[#f9f9f9] dark:bg-darkthemeitems hover:bg-[#88AB61]/10 dark:hover:bg-[#88AB61]/20 transition-colors group border border-transparent hover:border-[#88AB61]/20"
                                        aria-label={contact.label}
                                    >
                                        <Icon 
                                            size={18} 
                                            className="transition-colors"
                                            style={{ color: config.color || '#88AB61' }} 
                                        />
                                        {contact.label && (
                                            <span className="text-sm font-medium text-[#555555] dark:text-[#cccccc] group-hover:text-[#333333] dark:group-hover:text-white">
                                                {contact.label}
                                            </span>
                                        )}
                                    </a>
                                );
                            })}

                            {/* Fallback Legacy Fields (only if no dynamic contacts) */}
                            {contactDetails.length === 0 && (
                                <>
                                    {restaurant?.phone && (
                                        <a href={`tel:${restaurant.phone}`} className="flex items-center gap-2 p-2.5 rounded-lg bg-[#f9f9f9] dark:bg-darkthemeitems hover:bg-[#88AB61]/10 dark:hover:bg-[#88AB61]/20 transition-colors group">
                                            <Phone size={18} className="text-[#88AB61]" />
                                            <span className="text-sm font-medium text-[#555555] dark:text-[#cccccc]">{restaurant.phone}</span>
                                        </a>
                                    )}
                                    {restaurant?.email && (
                                        <a href={`mailto:${restaurant.email}`} className="flex items-center gap-2 p-2.5 rounded-lg bg-[#f9f9f9] dark:bg-darkthemeitems hover:bg-[#88AB61]/10 dark:hover:bg-[#88AB61]/20 transition-colors group">
                                            <Mail size={18} className="text-[#88AB61]" />
                                            <span className="text-sm font-medium text-[#555555] dark:text-[#cccccc]">{restaurant.email}</span>
                                        </a>
                                    )}
                                    {restaurant?.website && (
                                        <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2.5 rounded-lg bg-[#f9f9f9] dark:bg-darkthemeitems hover:bg-[#88AB61]/10 dark:hover:bg-[#88AB61]/20 transition-colors group">
                                            <Globe size={18} className="text-[#88AB61]" />
                                            <span className="text-sm font-medium text-[#555555] dark:text-[#cccccc]">{t('common.website')}</span>
                                        </a>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <div className="bg-gray-100 dark:bg-[#88AB61]/20 px-2 py-4 text-center space-y-3">
                <div className="flex flex-col items-center space-y-2">
                    {isPaymentRequired && (
                        <>
                            <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">{t("reservationWidget.footer.poweredBy")}</p>
                            <div className="flex items-center justify-center space-x-4">
                                <img src={visaLogo} alt="Visa" className="h-6 w-auto object-contain rounded border border-gray-300 dark:border-gray-600 bg-white shadow-sm" />
                                <img src={masterCardLogo} alt="MasterCard" className="h-6 w-auto object-contain rounded border border-gray-300 dark:border-gray-600 bg-white shadow-sm" />
                                <img src={cmiLogo} alt="CMI" className="h-6 w-auto object-contain rounded border border-gray-300 dark:border-gray-600 bg-white shadow-sm" />
                            </div>
                        </>
                    )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-600 pt-2">{t("reservationWidget.footer.copyright", { year: new Date().getFullYear() })}</p>
            </div>
        </div>
    );
});