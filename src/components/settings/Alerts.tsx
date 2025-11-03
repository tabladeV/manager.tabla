import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash, Pencil, X, Upload, Loader2 } from 'lucide-react';
import BaseInput from '../common/BaseInput';
import InlineQuillEditor from '../common/InlineQuillEditor';
import BaseBtn from '../common/BaseBtn';
import Portal from '../common/Portal';
import { useDarkContext } from '../../context/DarkContext';
import { useList, useCreate, useUpdate, useDelete, BaseKey, HttpError, useOne } from '@refinedev/core';

// The Alert type used throughout the component
interface Alert {
  id: BaseKey;
  title: string;
  description: string;
  image: string | File | null; // Can be a server URL (string), a local file, or null
  start_date: string;
  end_date: string;
  is_active: boolean;
}

// Default state for a new alert
const defaultAlertState: Omit<Alert, 'id'> = {
    title: '',
    description: '',
    image: null,
    start_date: '',
    end_date: '',
    is_active: true,
};

// Props for the modal component
interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (alert: Alert) => void;
    alert: Alert | null;
    isLoading: boolean; // Prop to indicate loading state
}

const AlertModal: React.FC<AlertModalProps> = ({ isOpen, onClose, onSave, alert, isLoading }) => {
    const { t } = useTranslation();
    const [currentAlert, setCurrentAlert] = useState<Alert>({ ...defaultAlertState, id: '' });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const imageInputRef = React.useRef<HTMLInputElement>(null);

    const isFormValid = useMemo(() => {
        return (
            currentAlert.title.trim() !== '' &&
            currentAlert.start_date !== '' &&
            currentAlert.end_date !== '' &&
            (!currentAlert.start_date || !currentAlert.end_date || currentAlert.start_date <= currentAlert.end_date)
        );
    }, [currentAlert.title, currentAlert.start_date, currentAlert.end_date]);

    const quillModules = {
        toolbar: [
            [{ 'header': '1' }, { 'header': '2' }], ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'align': [] }], ['link'], [{ 'color': [] }, { 'background': [] }], ['clean']
        ],
    };

    // Effect to set up the modal state when it opens or the alert prop changes
    useEffect(() => {
        if (isOpen) {
            const initialAlert = alert ? { ...alert } : { ...defaultAlertState, id: '' };
            setCurrentAlert(initialAlert);

            if (initialAlert.image && typeof initialAlert.image === 'string') {
                setImagePreview(initialAlert.image); // It's a URL from the server
            } else {
                setImagePreview(null);
            }
        } else {
            // When modal is closed, reset everything to default
            setCurrentAlert({ ...defaultAlertState, id: '' });
            setImagePreview(null);
        }
    }, [alert, isOpen]);

    // Handle new image selection
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setCurrentAlert(prev => ({ ...prev, image: file }));
            const objectUrl = URL.createObjectURL(file);
            setImagePreview(objectUrl);
        }
    };

    // Handle image removal
    const removeImage = () => {
        setCurrentAlert(prev => ({ ...prev, image: null }));
        setImagePreview(null);
        if (imageInputRef.current) {
            imageInputRef.current.value = "";
        }
    };

    const handleSave = () => {
        if (!isFormValid) return;
        onSave(currentAlert);
    };

    if (!isOpen) return null;

    return (
        <Portal>
            <div className="overlay" onClick={onClose}></div>
            <div className={`sidepopup w-[60%] lt-sm:popup lt-sm:h-auto lt-sm:bottom-0 lt-sm:rounded-b-none lt-sm:w-full h-full pa-0 dark:bg-bgdarktheme bg-white`}>
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">{alert ? t('alerts.editTitle') : t('alerts.addTitle')}</h1>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-softgreytheme dark:hover:bg-darkthemeitems" disabled={isLoading}>
                        <X size={20} />
                    </button>
                </div>
                <div className="flex flex-col gap-4 pb-16 overflow-auto">
                    <div>
                        <label className="block text-sm font-medium mb-2">{t('alerts.image')}</label>
                        <div className="relative w-[60%] mx-auto aspect-video bg-gray-100 dark:bg-darkthemeitems rounded-lg overflow-hidden">
                            {imagePreview ? (
                                <>
                                    <img src={imagePreview} alt="Alert Preview" className="w-full h-full object-cover" />
                                    <button
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                                        disabled={isLoading}
                                    >
                                        <X size={16} />
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => imageInputRef.current?.click()}
                                    className="w-full h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-darkthemeitems/50"
                                    disabled={isLoading}
                                >
                                    <Upload size={24} />
                                    <span>{t('alerts.uploadImage')}</span>
                                </button>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={imageInputRef}
                            onChange={handleImageUpload}
                            accept="image/*"
                            className="hidden"
                            disabled={isLoading}
                        />
                    </div>

                    <BaseInput
                        label={t('alerts.titleLabel')}
                        value={currentAlert.title}
                        onChange={(val) => setCurrentAlert({ ...currentAlert, title: val })}
                        placeholder={t('alerts.titlePlaceholder')}
                        variant="outlined"
                        disabled={isLoading}
                        rules={[(value) => !!value.trim() ? null : t('common.validation.requiredField')]}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <BaseInput label={t('paymentSettings.startDate')} type="date" value={currentAlert.start_date} onChange={(val) => setCurrentAlert({ ...currentAlert, start_date: val })} rules={[(value) => !!value ? null : t('common.validation.requiredField'), (value) => (currentAlert.end_date && value > currentAlert.end_date) ? t('paymentSettings.errors.startDateAfterEnd') : null,]} variant="outlined" disabled={isLoading} />
                        <BaseInput label={t('paymentSettings.endDate')} type="date" value={currentAlert.end_date} onChange={(val) => setCurrentAlert({ ...currentAlert, end_date: val })} rules={[(value) => !!value ? null : t('common.validation.requiredField'), (value) => (currentAlert.start_date && value < currentAlert.start_date) ? t('paymentSettings.errors.endDateBeforeStart') : null,]} variant="outlined" disabled={isLoading} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">{t('alerts.descriptionLabel')}</label>
                        <InlineQuillEditor
                            value={currentAlert.description}
                            onChange={(val) => setCurrentAlert({ ...currentAlert, description: val })}
                            placeholder={t('alerts.descriptionPlaceholder')}
                            modules={quillModules}
                        />
                    </div>
                    
                    <label className="flex items-center cursor-pointer">
                        <input type="checkbox" checked={currentAlert.is_active} onChange={(e) => setCurrentAlert({ ...currentAlert, is_active: e.target.checked })} className="sr-only" disabled={isLoading} />
                        <span className={`w-10 h-5 rounded-full p-1 flex items-center transition-colors ${currentAlert.is_active ? 'bg-greentheme' : 'bg-gray-300 dark:bg-gray-600'}`}>
                            <span className={`w-3.5 h-3.5 bg-white rounded-full shadow-md transform transition-transform ${currentAlert.is_active ? 'translate-x-5' : ''}`} />
                        </span>
                        <span className="ml-3 select-none">{t('alerts.active')}</span>
                    </label>
                </div>
                <div className="flex justify-end gap-2 mt-4 absolute bottom-[10px] right-[40px] w-[calc(100%-20px)]">
                    <BaseBtn variant="outlined" onClick={onClose} disabled={isLoading}>{t('common.cancel')}</BaseBtn>
                    <BaseBtn onClick={handleSave} disabled={isLoading || !isFormValid} loading={isLoading}>
                        {t('common.save')}
                    </BaseBtn>
                </div>
            </div>
        </Portal>
    );
};

export default function Alerts() {
    const { t } = useTranslation();
    const { darkMode: isDarkMode } = useDarkContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
    const [editingAlertId, setEditingAlertId] = useState<BaseKey | null>(null);

    const { data: alertsData, refetch } = useList<Alert>({
        resource: "api/v1/bo/events/",
        pagination: { pageSize: 100 }
    });

    const { data: singleAlertData, refetch: fetchOneAlert, isLoading: isFetchingOne } = useOne<Alert>({
        resource: "api/v1/bo/events",
        id: (editingAlertId || "") + '/',
        queryOptions: {
            enabled: false, // We will trigger this fetch manually
        }
    });

    const { mutate: createAlert, isLoading: isCreateLoading } = useCreate<Alert, HttpError, FormData>();
    const { mutate: updateAlert, isLoading: isUpdateLoading } = useUpdate<Alert, HttpError, FormData>();
    const { mutate: deleteAlert } = useDelete();

    const alerts = useMemo(() => (alertsData?.data as any)?.results || [], [alertsData]);

    const handleAddAlert = () => {
        setEditingAlert(null);
        setEditingAlertId(null);
        setIsModalOpen(true);
    };

    const handleEditAlert = (alert: Alert) => {
        setEditingAlertId(alert.id);
        setIsModalOpen(true); // Open modal immediately
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingAlert(null);
        setEditingAlertId(null);
    };

    // Fetch data when modal is opened for an existing alert
    useEffect(() => {
        if (editingAlertId && isModalOpen) {
            fetchOneAlert();
        }
    }, [editingAlertId, isModalOpen, fetchOneAlert]);

    // Populate form when fetched data is available
    useEffect(() => {
        // This effect runs when the data comes back from the fetch OR when we decide to edit a new item.
        // If we have an ID we want to edit and the corresponding data is available, we set the state.
        if (editingAlertId && singleAlertData?.data) {
            // Ensure the data we have matches the ID we want to edit
            if (singleAlertData.data.id == editingAlertId) {
                try {
                    setEditingAlert({ ...singleAlertData.data, description: JSON.parse(singleAlertData.data.description) } as Alert);
                } catch {
                    setEditingAlert(singleAlertData.data);
                }
            }
        }
    }, [singleAlertData, editingAlertId]); // Add editingAlertId to the dependency array

    const handleDeleteAlert = (id: BaseKey) => {
        deleteAlert({
            resource: "api/v1/bo/events",
            id: `${id}/`,
        }, {
            onSuccess: () => refetch(),
        });
    };

    const handleSaveAlert = (alert: Alert) => {
        const formData = new FormData();
        formData.append('title', alert.title);
        formData.append('description', JSON.stringify(alert.description));
        formData.append('is_active', String(alert.is_active));
        formData.append('start_date', alert.start_date);
        formData.append('end_date', alert.end_date);

        if (alert.image instanceof File) {
            formData.append('image', alert.image);
        } else if (alert.image === null) {
            formData.append('image', '');
        }

        const onSaveSuccess = () => {
            refetch();
            handleCloseModal();
        };

        if (alert.id && alert.id !== '') {
            updateAlert({
                resource: "api/v1/bo/events",
                id: `${alert.id}/`,
                values: formData,
            }, {
                onSuccess: onSaveSuccess,
            });
        } else {
            createAlert({
                resource: "api/v1/bo/events/",
                values: formData,
            }, {
                onSuccess: onSaveSuccess,
            });
        }
    };

    const handleToggleStatus = (alert: Alert) => {
        updateAlert({
            resource: `api/v1/bo/events`,
            id: `${alert.id}/status/`,
            values: { is_active: !alert.is_active } as any,
        }, {
            onSuccess: () => refetch(),
        });
    };

    // Determine the overall loading state for the modal
    const isModalLoading = isCreateLoading || isUpdateLoading || (isFetchingOne && !!editingAlertId);

    return (
        <div className={`w-full rounded-[10px] p-4 ${isDarkMode ? "bg-bgdarktheme" : "bg-white"}`}>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">{t('alerts.title')}</h1>
                <BaseBtn onClick={handleAddAlert}><Plus size={16} /> {t('alerts.addNew')}</BaseBtn>
            </div>

            <div className="overflow-x-auto w-full mt-4">
                <table className={`w-full border-collapse text-left text-sm ${isDarkMode ? "bg-bgdarktheme2" : "bg-white text-gray-500"}`}>
                    <thead className={`${isDarkMode ? "bg-bgdarktheme text-white" : "bg-white text-gray-900"}`}>
                        <tr>
                            <th scope="col" className="px-6 py-4 font-medium">{t('alerts.table.image')}</th>
                            <th scope="col" className="px-6 py-4 font-medium">{t('alerts.table.title')}</th>
                            <th scope="col" className="px-6 py-4 font-medium">{t('alerts.table.period')}</th>
                            <th scope="col" className="px-6 py-4 font-medium">{t('alerts.table.status')}</th>
                            <th scope="col" className="px-6 py-4 font-medium text-right">{t('alerts.table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y border-t ${isDarkMode ? "border-darkthemeitems divide-darkthemeitems" : "border-gray-200"}`}>
                        {alerts.map((alert: Alert) => (
                            <tr key={alert.id} className={`${isDarkMode ? "hover:bg-bgdarktheme" : "hover:bg-gray-50"}`}>
                                <td className="px-6 py-4">
                                    <img src={typeof alert.image === 'string' ? alert.image : 'https://picsum.photos/seed/placeholder/192/108'} alt={alert.title} className="w-16 h-10 object-cover rounded-md bg-gray-200" />
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{alert.title}</td>
                                <td className="px-6 py-4 text-gray-900 dark:text-white">
                                    {alert.start_date} / {alert.end_date}
                                </td>
                                <td className="px-6 py-4">
                                    <label className="flex items-center cursor-pointer">
                                        <input type="checkbox" checked={alert.is_active} onChange={() => handleToggleStatus(alert)} className="sr-only" />
                                        <span className={`w-10 h-5 rounded-full p-1 flex items-center transition-colors ${alert.is_active ? 'bg-greentheme' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                            <span className={`w-3.5 h-3.5 bg-white rounded-full shadow-md transform transition-transform ${alert.is_active ? 'translate-x-5' : ''}`} />
                                        </span>
                                    </label>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <button className="btn-secondary p-2" onClick={() => handleEditAlert(alert)}><Pencil size={15} /></button>
                                        <button className="btn-secondary bg-softredtheme text-redtheme hover:bg-redtheme hover:text-white p-2" onClick={() => handleDeleteAlert(alert.id)}><Trash size={15} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <AlertModal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                onSave={handleSaveAlert} 
                alert={editingAlert}
                isLoading={isModalLoading}
            />
        </div>
    );
}