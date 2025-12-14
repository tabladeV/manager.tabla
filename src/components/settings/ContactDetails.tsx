import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Phone, Mail, Globe, Facebook, Instagram, Twitter, Linkedin,
    MessageCircle, Link as LinkIcon, Plus, Trash2, Edit, X,
    Check
} from 'lucide-react';
import { MapPinned } from 'lucide-react';
import { useList, useCreate, useUpdate, useDelete, BaseKey, BaseRecord } from '@refinedev/core';
import BaseBtn from '../common/BaseBtn';
import Portal from '../common/Portal';

interface ContactDetail extends BaseRecord {
    id: BaseKey;
    type: string;
    label: string;
    value: string;
}

interface ContactDetailsResponse {
    results: ContactDetail[];
    count: number;
}

const ContactDetails = () => {
    const { t } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<BaseKey | null>(null);
    const [formData, setFormData] = useState({
        type: 'WEBSITE',
        label: '',
        value: ''
    });

    const CONTACT_TYPES = [
        { value: 'PHONE', label: t('settingsPage.general.contactDetails.types.phone', 'Phone Number'), icon: Phone, color: '' },
        { value: 'WHATSAPP', label: t('settingsPage.general.contactDetails.types.whatsapp', 'WhatsApp'), icon: MessageCircle, color: '#25D366' },
        { value: 'EMAIL', label: t('settingsPage.general.contactDetails.types.email', 'Email'), icon: Mail, color: '' },
        { value: 'WEBSITE', label: t('settingsPage.general.contactDetails.types.website', 'Website'), icon: Globe, color: '' },
        { value: 'TWITTER', label: t('settingsPage.general.contactDetails.types.twitter', 'Twitter'), icon: Twitter, color: '#1DA1F2' },
        { value: 'INSTAGRAM', label: t('settingsPage.general.contactDetails.types.instagram', 'Instagram'), icon: Instagram, color: '#E1306C' },
        { value: 'FACEBOOK', label: t('settingsPage.general.contactDetails.types.facebook', 'Facebook'), icon: Facebook, color: '#1877F2' },
        { value: 'LINKEDIN', label: t('settingsPage.general.contactDetails.types.linkedin', 'LinkedIn'), icon: Linkedin, color: '#0A66C2' },
        { value: 'TIKTOK', label: t('settingsPage.general.contactDetails.types.tiktok', 'TikTok'), icon: LinkIcon, color: '#FE2C55' },
        { value: 'TRIP_ADVISOR', label: t('settingsPage.general.contactDetails.types.tripAdvisor', 'Trip Advisor'), icon: LinkIcon, color: '#00AF87' },
        // { value: 'BOOKING', label: t('settingsPage.general.contactDetails.types.booking', 'Booking.com'), icon: LinkIcon, color: '#003580' },
        // { value: 'AIRBNB', label: t('settingsPage.general.contactDetails.types.airbnb', 'AirBnb'), icon: LinkIcon, color: '#FF5A5F' },
        { value: 'GOOGLE_MAPS', label: t('settingsPage.general.contactDetails.types.googleMaps', 'Google Maps'), icon: MapPinned, color: '#4285F4' },
    ];

    // Fetch Data
    const { data: listData, isLoading, refetch } = useList({
        resource: 'api/v1/bo/contact-details/',
        pagination: { mode: "off" }
    });

    const contacts = (listData?.data as unknown as ContactDetailsResponse)?.results || [];

    // Mutations
    const { mutate: createContact, isLoading: isCreating } = useCreate();
    const { mutate: updateContact, isLoading: isUpdating } = useUpdate();
    const { mutate: deleteContact } = useDelete();

    const handleOpenModal = (contact?: ContactDetail) => {
        if (contact) {
            setEditingId(contact.id);
            setFormData({
                type: contact.type,
                label: contact.label,
                value: contact.value
            });
        } else {
            setEditingId(null);
            setFormData({
                type: 'WEBSITE',
                label: '',
                value: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingId) {
            updateContact({
                resource: 'api/v1/bo/contact-details/',
                id: editingId,
                values: formData,
                successNotification: {
                    message: t('settingsPage.general.contactDetails.notifications.updated', 'Contact updated successfully'),
                    type: 'success',
                }
            }, {
                onSuccess: () => {
                    handleCloseModal();
                    refetch();
                }
            });
        } else {
            createContact({
                resource: 'api/v1/bo/contact-details/',
                values: formData,
                successNotification: {
                    message: t('settingsPage.general.contactDetails.notifications.created', 'Contact created successfully'),
                    type: 'success',
                }
            }, {
                onSuccess: () => {
                    handleCloseModal();
                    refetch();
                }
            });
        }
    };

    const handleDelete = (id: BaseKey) => {
        if (window.confirm(t('settingsPage.general.contactDetails.confirmDelete', 'Are you sure you want to delete this contact?'))) {
            deleteContact({
                resource: 'api/v1/bo/contact-details',
                id: id+'/',
                successNotification: {
                    message: t('settingsPage.general.contactDetails.notifications.deleted', 'Contact deleted successfully'),
                    type: 'success',
                }
            }, {
                onSuccess: () => refetch()
            });
        }
    };

    return (
        <div className={`rounded-[10px] p-3 w-full dark:bg-bgdarktheme bg-white mt-4`}>
            <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                <h2 className="text-lg font-medium">
                    {t('settingsPage.general.contactDetails.title', 'Extra Contact & Socials')}
                </h2>
                <BaseBtn 
                    variant="secondary" 
                    onClick={() => handleOpenModal()}
                    className="!py-1 !px-3 text-sm"
                >
                    <Plus size={16} className="mr-1" />
                    {t('settingsPage.general.contactDetails.add', 'Add')}
                </BaseBtn>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-4">Loading...</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {contacts.map((detail) => {
                        const selectedType = CONTACT_TYPES.find(t => t.value === detail.type);
                        const Icon = selectedType ? selectedType.icon : LinkIcon;
                        const iconColor = selectedType?.color;

                        return (
                            <div key={detail.id} className="flex items-center justify-between gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow bg-gray-50 dark:bg-darkthemeitems/50">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="p-2 bg-white dark:bg-darkthemeitems rounded-full shrink-0 shadow-sm">
                                        <Icon
                                            size={18}
                                            className={!iconColor ? "text-gray-600 dark:text-gray-300" : ""}
                                            style={iconColor ? { color: iconColor } : {}}
                                        />
                                    </div>
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="font-medium text-sm truncate text-gray-900 dark:text-gray-100">
                                            {detail.label || selectedType?.label}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {detail.value}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                    <button
                                        onClick={() => handleOpenModal(detail)}
                                        className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(detail.id)}
                                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    {contacts.length === 0 && (
                        <div className="col-span-full text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
                            {t('settingsPage.general.contactDetails.empty', 'No contact details added yet.')}
                        </div>
                    )}
                </div>
            )}

            {isModalOpen && (
                <Portal>
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-bgdarktheme rounded-xl shadow-xl w-full max-w-2xl">
                            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold">
                                    {editingId 
                                        ? t('settingsPage.general.contactDetails.edit', 'Edit Contact') 
                                        : t('settingsPage.general.contactDetails.add', 'Add Contact')
                                    }
                                </h3>
                                <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                    <X size={24} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
                                <div className="max-h-[70vh] overflow-y-auto px-2">
                                {/* Type Selection */}
                                <div>
                                    <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                                        {t('settingsPage.general.contactDetails.form.type', 'Contact Type')}
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {CONTACT_TYPES.map((type) => {
                                            const Icon = type.icon;
                                            const isSelected = formData.type === type.value;
                                            return (
                                                <div 
                                                    key={type.value}
                                                    onClick={() => setFormData({...formData, type: type.value})}
                                                    className={`
                                                        cursor-pointer flex items-center gap-2 p-3 rounded-lg border transition-all
                                                        ${isSelected 
                                                            ? 'border-greentheme bg-greentheme/10 ring-1 ring-greentheme' 
                                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                        }
                                                    `}
                                                >
                                                    <Icon 
                                                        size={18} 
                                                        className={isSelected ? 'text-greentheme' : 'text-gray-500'}
                                                        style={!isSelected && type.color ? { color: type.color } : {}}
                                                    />
                                                    <span className={`text-sm ${isSelected ? 'font-medium text-greentheme' : 'text-gray-600 dark:text-gray-300'}`}>
                                                        {type.label}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Label Input */}
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        {t('settingsPage.general.contactDetails.form.label', 'Label')} 
                                        <span className="text-xs text-gray-500 ml-1">(Max 20 chars)</span>
                                    </label>
                                    <input
                                        type="text"
                                        maxLength={20}
                                        required
                                        value={formData.label}
                                        onChange={(e) => setFormData({...formData, label: e.target.value})}
                                        placeholder="e.g. Support, Main Website..."
                                        className="inputs w-full dark:bg-darkthemeitems bg-white"
                                    />
                                </div>

                                {/* Value Input */}
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        {t('settingsPage.general.contactDetails.form.value', 'Value / Link')}
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.value}
                                        onChange={(e) => setFormData({...formData, value: e.target.value})}
                                        placeholder="e.g. +1234567890, https://example.com..."
                                        className="inputs w-full dark:bg-darkthemeitems bg-white"
                                    />
                                </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <BaseBtn 
                                        type="button" 
                                        variant="secondary" 
                                        onClick={handleCloseModal}
                                    >
                                        {t('common.cancel', 'Cancel')}
                                    </BaseBtn>
                                    <BaseBtn 
                                        type="submit" 
                                        variant="primary"
                                        loading={isCreating || isUpdating}
                                    >
                                        {t('common.save', 'Save')}
                                    </BaseBtn>
                                </div>
                            </form>
                        </div>
                    </div>
                </Portal>
            )}
        </div>
    );
};

export default ContactDetails;