import React, { memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Phone, Mail, Globe } from 'lucide-react';
import visaLogo from "../../assets/VISA.jpg";
import masterCardLogo from "../../assets/MasterCard.jpg";
import cmiLogo from "../../assets/CMI.jpg";

interface QuillPreviewProps {
    content: string;
    className?: string;
}

const QuillPreview = memo(({ content, className = "" }: QuillPreviewProps) => {
    useEffect(() => {
        if (typeof window !== "undefined") {
            import("quill/dist/quill.core.css");
        }
    }, []);

    return (
        <div className={`quill-preview ${className}`}>
            <div className="prose max-w-none overflow-auto" dangerouslySetInnerHTML={{ __html: content }} />
        </div>
    );
});

export const SharedWidgetFooter = memo(({ widgetInfo, isPaymentRequired, showDescription = false }: { widgetInfo: any, isPaymentRequired: boolean, showDescription?: boolean }) => {
    const { t } = useTranslation();
    const restaurant = widgetInfo?.restaurant;

    return (
        <>
            {widgetInfo?.content && showDescription && (
                <div className="px-6 pb-6">
                    <div className="text-[#333333] dark:text-[#e1e1e1]">
                        <QuillPreview content={widgetInfo.content} />
                    </div>
                </div>
            )}
            <div className="px-6 pb-6">
                <div className="border-t border-[#dddddd] dark:border-[#444444] pt-4">
                    <h3 className="text-lg font-medium mb-4 text-center text-[#333333] dark:text-[#e1e1e1]">{t("reservationWidget.contact.followUs")}</h3>
                    <div className="flex justify-center items-center gap-4 flex-wrap">
                        {restaurant?.phone && (
                            <a href={`tel:${restaurant.phone}`} className="flex items-center gap-2 p-3 rounded-lg bg-[#f9f9f9] dark:bg-darkthemeitems hover:bg-[#88AB61]/10 dark:hover:bg-[#88AB61]/20 transition-colors group" aria-label="Call us">
                                <Phone size={20} className="text-[#88AB61] group-hover:text-[#769c4f]" />
                                <span className="text-sm font-medium text-[#555555] dark:text-[#cccccc] group-hover:text-[#88AB61]">{restaurant.phone}</span>
                            </a>
                        )}
                        {restaurant?.email && (
                            <a href={`mailto:${restaurant.email}`} className="flex items-center gap-2 p-3 rounded-lg bg-[#f9f9f9] dark:bg-darkthemeitems hover:bg-[#88AB61]/10 dark:hover:bg-[#88AB61]/20 transition-colors group" aria-label="Email us">
                                <Mail size={20} className="text-[#88AB61] group-hover:text-[#769c4f]" />
                                <span className="text-sm font-medium text-[#555555] dark:text-[#cccccc] group-hover:text-[#88AB61]">{restaurant.email}</span>
                            </a>
                        )}
                        {restaurant?.website && (
                            <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 rounded-lg bg-[#f9f9f9] dark:bg-darkthemeitems hover:bg-[#88AB61]/10 dark:hover:bg-[#88AB61]/20 transition-colors group" aria-label="Website">
                                <Globe size={20} className="text-[#88AB61] group-hover:text-[#769c4f]" />
                                <span className="text-sm font-medium text-[#555555] dark:text-[#cccccc] group-hover:text-[#88AB61]">{restaurant.name}</span>
                            </a>
                        )}
                    </div>
                </div>
            </div>
            <div className="bg-gray-100 dark:bg-[#88AB61]/20 px-6 py-4 text-center space-y-3">
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
        </>
    );
});