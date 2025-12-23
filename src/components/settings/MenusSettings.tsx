import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash, Eye, X, Upload, FileText } from 'lucide-react';
import BaseInput from '../common/BaseInput';
import BaseBtn from '../common/BaseBtn';
import Portal from '../common/Portal';
import { useDarkContext } from '../../context/DarkContext';
import { useList, useCreate, useUpdate, useDelete, HttpError } from '@refinedev/core';

// Interface for Menu
export interface Menu {
  id: string;
  name: string;
  status: 'active' | 'archived';
  file: string | null;
}

// Props for the modal component
interface MenuModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (menu: { name: string; file: File | null }) => void;
    isLoading: boolean;
}

const MenuModal: React.FC<MenuModalProps> = ({ isOpen, onClose, onSave, isLoading }) => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isFormValid = useMemo(() => {
        return (
            name.trim() !== '' &&
            file !== null
        );
    }, [name, file]);

    useEffect(() => {
        if (!isOpen) {
            setName('');
            setFile(null);
        }
    }, [isOpen]);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const removeFile = () => {
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSave = () => {
        if (!isFormValid) return;
        onSave({ name, file });
    };

    if (!isOpen) return null;

    return (
        <Portal>
            <div className="overlay glassmorphism" onClick={onClose}></div>
            <div className={`sidepopup w-[60%] lt-sm:popup lt-sm:h-auto lt-sm:bottom-0 lt-sm:rounded-b-none lt-sm:w-full h-full pa-0 dark:bg-bgdarktheme bg-white`}>
                <div className="flex justify-between items-center mb-4 p-6 pb-0">
                    <h2 className="text-xl font-bold dark:text-white text-black">
                        {t('settingsPage.menus.addNew')}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="flex flex-col gap-6 flex-1 overflow-y-auto p-6 pt-0 pb-20">
                    <BaseInput
                        label={t('settingsPage.menus.alias')}
                        value={name}
                        onChange={(val) => setName(val)}
                        placeholder={t('settingsPage.menus.namePlaceholder')}
                        variant="outlined"
                    />

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('settingsPage.menus.pdfLabel')}
                        </label>
                        
                        {!file ? (
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-greentheme transition-colors"
                            >
                                <Upload className="text-gray-400 mb-2" size={32} />
                                <span className="text-sm text-gray-500 dark:text-gray-400">{t('settingsPage.menus.uploadLabel')}</span>
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept="application/pdf"
                                    className="hidden"
                                />
                            </div>
                        ) : (
                            <div className="relative border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center gap-3 bg-gray-50 dark:bg-bgdarktheme2">
                                <FileText className="text-greentheme" size={24} />
                                <span className="text-sm font-medium truncate flex-1 dark:text-white">
                                    {file.name}
                                </span>
                                <button 
                                    onClick={removeFile}
                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                                >
                                    <X size={16} className="text-red-500" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-4 absolute bottom-[10px] right-[40px] w-[calc(100%-20px)]">
                    <BaseBtn variant="outlined" onClick={onClose}>
                        {t('common.cancel')}
                    </BaseBtn>
                    <BaseBtn onClick={handleSave} disabled={!isFormValid || isLoading} loading={isLoading}>
                        {t('common.save')}
                    </BaseBtn>
                </div>
            </div>
        </Portal>
    );
};

export default function MenusSettings() {
    const { t } = useTranslation();
    const { darkMode: isDarkMode } = useDarkContext();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: menusData, isLoading: isListLoading, refetch } = useList<Menu>({
        resource: "api/v1/bo/restaurants/current/widgets/menu-items/",
        pagination: {
            mode: "off"
        }
    });

    const menus = ((menusData?.data as any)?.results as unknown as Menu[]) || [];

    const { mutate: createMenu, isLoading: isCreateLoading } = useCreate<Menu, HttpError, FormData>();
    const { mutate: deleteMenu } = useDelete();
    const { mutate: updateMenu } = useUpdate<Menu, HttpError, { status: string }>();

    const handleAddMenu = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSaveMenu = (data: { name: string; file: File | null }) => {
        if (!data.file) return;

        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('file', data.file);
        formData.append('status', 'active');

        createMenu({
            resource: "api/v1/bo/restaurants/current/widgets/menu-items/",
            values: formData,
        }, {
            onSuccess: () => {
                handleCloseModal();
                refetch();
            }
        });
    };

    const handleDeleteMenu = (id: string) => {
        if (window.confirm(t('settingsPage.menus.deleteConfirm'))) {
            deleteMenu({
                resource: "api/v1/bo/restaurants/current/widgets/menu-items",
                id: id,
            }, {
                onSuccess: () => refetch(),
            });
        }
    };

    const handleToggleStatus = (menu: Menu) => {
        const newStatus = menu.status === 'active' ? 'archived' : 'active';
        updateMenu({
            resource: "api/v1/bo/restaurants/current/widgets/menu-items",
            id: menu.id+'/',
            values: { status: newStatus },
        }, {
            onSuccess: () => refetch(),
        });
    };

    const handlePreview = (filePath: string | null) => {
        if (filePath) {
            window.open(filePath, '_blank');
        } else {
            alert(t('settingsPage.menus.noFile'));
        }
    };

    return (
        <div className={`w-full rounded-[10px] p-4 ${isDarkMode ? "bg-bgdarktheme" : "bg-white"}`}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-xl font-bold dark:text-white text-black">{t('settingsPage.menus.title')}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('settingsPage.menus.subtitle')}</p>
                </div>
                <BaseBtn onClick={handleAddMenu}>
                    <Plus size={18} />
                    {t('settingsPage.menus.addMenu')}
                </BaseBtn>
            </div>

            <div className="overflow-x-auto w-full mt-4">
                <table className={`w-full border-collapse text-left text-sm ${isDarkMode ? "bg-bgdarktheme2" : "bg-white text-gray-500"}`}>
                    <thead className={`${isDarkMode ? "bg-bgdarktheme text-white" : "bg-white text-gray-900"}`}>
                        <tr>
                            <th scope="col" className="px-6 py-4 font-medium">{t('settingsPage.menus.alias')}</th>
                            <th scope="col" className="px-6 py-4 font-medium">{t('settingsPage.menus.status')}</th>
                            <th scope="col" className="px-6 py-4 font-medium text-right">{t('settingsPage.menus.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y border-t ${isDarkMode ? "border-darkthemeitems divide-darkthemeitems" : "border-gray-200"}`}>
                        {isListLoading ? (
                             <tr>
                                <td colSpan={4} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                                    {t('common.loading')}
                                </td>
                            </tr>
                        ) : menus?.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                                    {t('settingsPage.menus.noMenus')}
                                </td>
                            </tr>
                        ) : (
                            menus?.map((menu) => (
                                <tr key={menu.id} className={`${isDarkMode ? "hover:bg-bgdarktheme" : "hover:bg-gray-50"}`}>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                        {menu.name}
                                    </td>
                                    <td className="px-6 py-4">
                                        <label className="flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only peer" 
                                                checked={menu.status === 'active'}
                                                onChange={() => handleToggleStatus(menu)}
                                            />
                                            <span className={`w-10 h-5 rounded-full p-1 flex items-center transition-colors ${menu.status === 'active' ? 'bg-greentheme' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                                <span className={`w-3.5 h-3.5 bg-white rounded-full shadow-md transform transition-transform ${menu.status === 'active' ? 'translate-x-5' : ''}`} />
                                            </span>
                                        </label>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button 
                                                onClick={() => handlePreview(menu.file)}
                                                className="p-2 text-gray-500 hover:text-greentheme hover:bg-greentheme/10 rounded-full transition-colors"
                                                title={t('settingsPage.menus.preview')}
                                            >
                                                <Eye size={18} />
                                            </button>
                                            
                                            <button 
                                                onClick={() => handleDeleteMenu(menu.id)}
                                                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                                                title={t('settingsPage.menus.delete')}
                                            >
                                                <Trash size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <MenuModal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                onSave={handleSaveMenu} 
                isLoading={isCreateLoading}
            />
        </div>
    );
}
