import { useState, memo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";

import spanish from "../../assets/spanish.png";
import arabic from "../../assets/arabic.jpg";
import english from "../../assets/english.png";
import french from "../../assets/french.png";
import { useDateContext } from "../../context/DateContext";

const LanguageSelector = memo(() => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const { preferredLanguage, setPreferredLanguage } = useDateContext();
    const languages = [
        { code: "en", name: "English", icon: english },
        { code: "es", name: "Español", icon: spanish },
        { code: "fr", name: "Français", icon: french },
        { code: "ar", name: "العربية", icon: arabic },
    ];

    const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];

    useEffect(() => {
        setPreferredLanguage(currentLanguage.code);
    }, [currentLanguage, setPreferredLanguage]);

    const handleLanguageChange = (languageCode: string) => {
        i18n.changeLanguage(languageCode);
        localStorage.setItem("preferredLanguage", languageCode);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-2 rounded-lg bg-[#f5f5f5] dark:bg-[#333333] bg-opacity-80 hover:bg-[#f5f5f5] dark:hover:bg-[#444444] transition-colors"
                aria-label="Select language"
            >
                <img src={currentLanguage.icon} alt={currentLanguage.name} className="w-6 h-6 rounded-full object-cover" />
                <span className="text-sm font-medium hidden sm:block">{currentLanguage.name}</span>
                <ChevronDown size={16} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 bg-white dark:bg-darkthemeitems rounded-lg shadow-lg border border-[#dddddd] dark:border-[#444444] z-50 min-w-[160px]">
                        {languages.map((language) => (
                            <button
                                key={language.code}
                                onClick={() => handleLanguageChange(language.code)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#f5f5f5] dark:hover:bg-bgdarktheme2 transition-colors first:rounded-t-lg last:rounded-b-lg ${currentLanguage.code === language.code ? "bg-[#f0f7e6] dark:bg-bgdarktheme2" : ""
                                    }`}
                            >
                                <img src={language.icon} alt={language.name} className="w-5 h-5 rounded-sm object-cover" />
                                <span className="text-sm font-medium">{language.name}</span>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
});

export default LanguageSelector;