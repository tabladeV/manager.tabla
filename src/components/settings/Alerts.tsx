import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash, Pencil, X, Upload, Eye } from 'lucide-react';
import BaseInput from '../common/BaseInput';
import InlineQuillEditor from '../common/InlineQuillEditor';
import BaseBtn from '../common/BaseBtn';
import Portal from '../common/Portal';
import { useDarkContext } from '../../context/DarkContext';

interface Alert {
  id: string;
  title: string;
  description: string;
  image: string | null;
  isActive: boolean;
}

const initialAlerts: Alert[] = [
  {
    id: '1',
    title: 'Summer Sale',
    description: '<p>Get <strong>50% off</strong> on all drinks this summer!</p>',
    image: 'https://picsum.photos/seed/1/800/450',
    isActive: true,
  },
  {
    id: '2',
    title: 'New Year Special Menu',
    description: '<p>Join us for a special menu to celebrate the new year. Book your table now!</p>',
    image: 'https://picsum.photos/seed/2/800/450',
    isActive: false,
  },
];

const defaultAlertState: Omit<Alert, 'id'> = {
    title: '',
    description: '',
    image: null,
    isActive: true,
};

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (alert: Alert) => void;
    alert: Alert | null;
}

const AlertModal: React.FC<AlertModalProps> = ({ isOpen, onClose, onSave, alert }) => {
    const { t } = useTranslation();
    const { darkMode: isDarkMode } = useDarkContext();
    const [currentAlert, setCurrentAlert] = useState<Alert>({ ...defaultAlertState, id: Date.now().toString() });
    const imageInputRef = React.useRef<HTMLInputElement>(null);
    const quillModules = {
        toolbar: [
            [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
            [{ size: [] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' },
            { 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'align': [] }],
            ['link'],
            [{ 'color': [] }, { 'background': [] }],
            ['clean']
        ],
    };

    React.useEffect(() => {
        if (isOpen) {
            if (alert) {
                setCurrentAlert(alert);
            } else {
                setCurrentAlert({ ...defaultAlertState, id: Date.now().toString() });
            }
        }
    }, [alert, isOpen]);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    setCurrentAlert(prev => ({ ...prev, image: e.target?.result as string }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        onSave(currentAlert);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <Portal>
            <div className="overlay" onClick={onClose}></div>
            <div className={`sidepopup w-[60%] lt-sm:popup lt-sm:h-auto lt-sm:bottom-0 lt-sm:rounded-b-none lt-sm:w-full h-full pa-0 dark:bg-bgdarktheme bg-white`}>
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">{alert ? t('alerts.editTitle') : t('alerts.addTitle')}</h1>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-softgreytheme dark:hover:bg-darkthemeitems">
                        <X size={20} />
                    </button>
                </div>
                <div className="flex flex-col gap-4 pb-16 overflow-auto">
                    <div>
                        <label className="block text-sm font-medium mb-2">{t('alerts.image')}</label>
                        <div className="relative w-[60%] mx-auto aspect-video bg-gray-100 dark:bg-darkthemeitems rounded-lg overflow-hidden">
                            {currentAlert.image ? (
                                <>
                                    <img src={currentAlert.image} alt="Alert" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => setCurrentAlert(prev => ({ ...prev, image: null }))}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => imageInputRef.current?.click()}
                                    className="w-full h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-darkthemeitems/50"
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
                        />
                    </div>

                    <BaseInput
                        label={t('alerts.titleLabel')}
                        value={currentAlert.title}
                        onChange={(val) => setCurrentAlert({ ...currentAlert, title: val })}
                        placeholder={t('alerts.titlePlaceholder')}
                        variant="outlined"
                    />

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
                        <input type="checkbox" checked={currentAlert.isActive} onChange={(e) => setCurrentAlert({ ...currentAlert, isActive: e.target.checked })} className="sr-only" />
                        <span className={`w-10 h-5 rounded-full p-1 flex items-center transition-colors ${currentAlert.isActive ? 'bg-greentheme' : 'bg-gray-300 dark:bg-gray-600'}`}>
                            <span className={`w-3.5 h-3.5 bg-white rounded-full shadow-md transform transition-transform ${currentAlert.isActive ? 'translate-x-5' : ''}`} />
                        </span>
                        <span className="ml-3 select-none">{t('alerts.active')}</span>
                    </label>
                </div>
                <div className="flex justify-end gap-2 mt-4 absolute bottom-[10px] right-[40px] w-[calc(100%-20px)]">
                    <BaseBtn variant="outlined" onClick={onClose}>{t('common.cancel')}</BaseBtn>
                    <BaseBtn onClick={handleSave}>{t('common.save')}</BaseBtn>
                </div>
            </div>
        </Portal>
    );
};

export default function Alerts() {
    const { t } = useTranslation();
    const { darkMode: isDarkMode } = useDarkContext();
    const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAlert, setEditingAlert] = useState<Alert | null>(null);

    const handleAddAlert = () => {
        setEditingAlert(null);
        setIsModalOpen(true);
    };

    const handleEditAlert = (alert: Alert) => {
        setEditingAlert(alert);
        setIsModalOpen(true);
    };

    const handleDeleteAlert = (id: string) => {
        setAlerts(alerts.filter(alert => alert.id !== id));
    };

    const handleSaveAlert = (alert: Alert) => {
        const exists = alerts.some(a => a.id === alert.id);
        if (exists) {
            setAlerts(alerts.map(a => a.id === alert.id ? alert : a));
        } else {
            setAlerts([...alerts, { ...alert, id: Date.now().toString() }]);
        }
    };

    const handleToggleStatus = (id: string) => {
        setAlerts(alerts.map(alert => alert.id === id ? { ...alert, isActive: !alert.isActive } : alert));
    };

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
                            <th scope="col" className="px-6 py-4 font-medium">{t('alerts.table.status')}</th>
                            <th scope="col" className="px-6 py-4 font-medium text-right">{t('alerts.table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y border-t ${isDarkMode ? "border-darkthemeitems divide-darkthemeitems" : "border-gray-200"}`}>
                        {alerts.map((alert) => (
                            <tr key={alert.id} className={`${isDarkMode ? "hover:bg-bgdarktheme" : "hover:bg-gray-50"}`}>
                                <td className="px-6 py-4">
                                    <img src={alert.image || 'https://picsum.photos/seed/seed/1920/1080'} alt={alert.title} className="w-16 h-10 object-cover rounded-md" />
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{alert.title}</td>
                                <td className="px-6 py-4">
                                    <label className="flex items-center cursor-pointer">
                                        <input type="checkbox" checked={alert.isActive} onChange={() => handleToggleStatus(alert.id)} className="sr-only" />
                                        <span className={`w-10 h-5 rounded-full p-1 flex items-center transition-colors ${alert.isActive ? 'bg-greentheme' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                            <span className={`w-3.5 h-3.5 bg-white rounded-full shadow-md transform transition-transform ${alert.isActive ? 'translate-x-5' : ''}`} />
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
            <AlertModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveAlert} alert={editingAlert} />
        </div>
    );
}