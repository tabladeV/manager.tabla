"use client"
import React, { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useDarkContext } from "../../context/DarkContext"
import { Check, Plus, Trash, Pencil, X } from "lucide-react"
import BaseBtn from "../common/BaseBtn"
import Portal from "../common/Portal"
import BaseInput from "../common/BaseInput"
import BaseTimeInput from "../common/BaseTimeInput"

// Interfaces
interface PaymentRule {
    id: number
    name: string
    status: boolean
    startDate: string
    endDate: string
    allDay: boolean
    fromTime: string
    toTime: string
    minGuestsForPayment: number
    depositAmountPerGuest: number,
    advanced?: null | any
}

interface PaymentRuleModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (rule: PaymentRule) => void
    rule: PaymentRule | null
}

// Dummy Data
const initialRules: PaymentRule[] = [
    { id: 1, name: "Weekend Dinner", status: true, startDate: "2024-01-01", endDate: "2024-12-31", allDay: false, fromTime: "18:00", toTime: "22:00", minGuestsForPayment: 4, depositAmountPerGuest: 15, advanced: null },
    { id: 2, name: "New Year's Eve", status: true, startDate: "2024-12-31", endDate: "2024-12-31", allDay: true, fromTime: "", toTime: "", minGuestsForPayment: 2, depositAmountPerGuest: 25, advanced: null },
    { id: 3, name: "Valentine's Day", status: false, startDate: "2025-02-14", endDate: "2025-02-14", allDay: true, fromTime: "", toTime: "", minGuestsForPayment: 1, depositAmountPerGuest: 20, advanced: null },
];

// Modal Component
const PaymentRuleModal: React.FC<PaymentRuleModalProps> = ({ isOpen, onClose, onSave, rule }) => {
    const { t } = useTranslation();
    const { darkMode: isDarkMode } = useDarkContext();
    const [currentRule, setCurrentRule] = useState<PaymentRule>(rule || { id: Date.now(), name: '', status: true, startDate: '', endDate: '', allDay: false, fromTime: '12:00', toTime: '21:00', minGuestsForPayment: 1, depositAmountPerGuest: 10 });

    useEffect(() => {
        if (rule) {
            setCurrentRule(rule);
        } else {
            setCurrentRule({ id: Date.now(), name: '', status: true, startDate: '', endDate: '', allDay: false, fromTime: '12:00', toTime: '21:00', minGuestsForPayment: 1, depositAmountPerGuest: 10 });
        }
    }, [rule, isOpen]);

    const handleSave = () => {
        // Basic validation before saving
        if (!currentRule.name.trim()) {
            // In a real app, you'd show a toast or better error feedback
            console.error("Rule name is required.");
            return;
        }
        if (currentRule.startDate && currentRule.endDate && currentRule.startDate > currentRule.endDate) {
            console.error("Start date cannot be after end date.");
            return;
        }
        onSave(currentRule);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <Portal>
            <div className="overlay" onClick={onClose}></div>
            <div className={`sidepopup lt-sm:popup lt-sm:h-auto lt-sm:bottom-0 lt-sm:rounded-b-none lt-sm:w-full h-full ${isDarkMode ? "bg-bgdarktheme" : "bg-white"}`}>
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl">{rule ? t('paymentSettings.editRule') : t('paymentSettings.addRule')}</h1>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-softgreytheme dark:hover:bg-darkthemeitems">
                        <X size={20} />
                    </button>
                </div>
                <div className="flex flex-col gap-4">
                    <BaseInput
                        label={t('paymentSettings.ruleName')}
                        value={currentRule.name}
                        onChange={(val) => setCurrentRule({ ...currentRule, name: val })}
                        rules={[(value) => value.trim() === '' ? t('paymentSettings.ruleNameRequired') : null]}
                        placeholder={t('paymentSettings.ruleNamePlaceholder')}
                        variant="outlined"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <BaseInput
                            label={t('settingsPage.widget.payment.minGuestsForPayment')}
                            type="number"
                            value={currentRule.minGuestsForPayment?.toString()}
                            onChange={(val) => setCurrentRule({ ...currentRule, minGuestsForPayment: Number(val) > 0 ? Number(val) : 1 })}
                            variant="outlined"
                        />
                        <BaseInput
                            label={t('settingsPage.widget.payment.depositAmountPerGuest')}
                            type="number"
                            value={currentRule.depositAmountPerGuest?.toString()}
                            onChange={(val) => setCurrentRule({ ...currentRule, depositAmountPerGuest: Number(val) >= 0 ? Number(val) : 0 })}
                            variant="outlined"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <BaseInput
                            label={t('paymentSettings.startDate')}
                            type="date"
                            value={currentRule.startDate}
                            onChange={(val) => setCurrentRule({ ...currentRule, startDate: val })}
                            rules={[
                                (value) => (currentRule.endDate && value > currentRule.endDate) ? t('paymentSettings.errors.startDateAfterEnd') : null,
                            ]}
                            variant="outlined"
                        />
                        <BaseInput
                            label={t('paymentSettings.endDate')}
                            type="date"
                            value={currentRule.endDate}
                            onChange={(val) => setCurrentRule({ ...currentRule, endDate: val })}
                            rules={[
                                (value) => (currentRule.startDate && value < currentRule.startDate) ? t('paymentSettings.errors.endDateBeforeStart') : null,
                            ]}
                            variant="outlined"
                        />
                    </div>
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={currentRule.allDay}
                            onChange={(e) => setCurrentRule({ ...currentRule, allDay: e.target.checked })}
                            className="sr-only"
                        />
                        <span className={`flex items-center justify-center w-5 h-5 border rounded-md mr-2 transition-all duration-200 ${currentRule.allDay ? 'bg-greentheme border-greentheme' : 'border-gray-300 dark:border-darkthemeitems'}`}>
                            {currentRule.allDay && <Check size={14} className="text-white" />}
                        </span>
                        <span className="select-none">{t('paymentSettings.allDay')}</span>
                    </label>
                    {!currentRule.allDay && (
                        <div className="grid grid-cols-2 gap-4 animate-fadeIn">
                            <BaseTimeInput
                                label={t('paymentSettings.fromTime')}
                                value={currentRule.fromTime}
                                onChange={(val) => setCurrentRule({ ...currentRule, fromTime: val || '' })}
                                variant="outlined"
                            />
                            <BaseTimeInput
                                label={t('paymentSettings.toTime')}
                                value={currentRule.toTime}
                                onChange={(val) => setCurrentRule({ ...currentRule, toTime: val || '' })}
                                variant="outlined"
                            />
                        </div>
                    )}
                </div>
                <div className="flex justify-end gap-2 mt-4 absolute bottom-[10px] right-[10px]">
                    <BaseBtn variant="outlined" onClick={onClose}>{t('common.cancel')}</BaseBtn>
                    <BaseBtn onClick={handleSave}>{t('common.save')}</BaseBtn>
                </div>
            </div>
        </Portal>
    );
};

// Main Component
export default function PaymentSettings() {
    const { t } = useTranslation();
    const { darkMode: isDarkMode } = useDarkContext();
    const [enablePayment, setEnablePayment] = useState(true);
    const [paymentMode, setPaymentMode] = useState<'always' | 'rules'>('rules');
    const [rules, setRules] = useState<PaymentRule[]>(initialRules);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<PaymentRule | null>(null);

    // State for 'Always' mode
    const [minGuestsForPayment, setMinGuestsForPayment] = useState<number>(1);
    const [depositAmountPerGuest, setDepositAmountPerGuest] = useState<number>(10);

    const handleAddRule = () => {
        setEditingRule(null);
        setIsModalOpen(true);
    };

    const handleEditRule = (rule: PaymentRule) => {
        setEditingRule(rule);
        setIsModalOpen(true);
    };

    const handleDeleteRule = (id: number) => {
        setRules(rules.filter(rule => rule.id !== id));
    };

    const handleSaveRule = (rule: PaymentRule) => {
        const exists = rules.some(r => r.id === rule.id);
        if (exists) {
            setRules(rules.map(r => r.id === rule.id ? rule : r));
        } else {
            setRules([...rules, rule]);
        }
    };

    const handleToggleRuleStatus = (id: number) => {
        setRules(rules.map(rule => rule.id === id ? { ...rule, status: !rule.status } : rule));
    };

    return (
        <div className={`w-full rounded-[10px] p-4 ${isDarkMode ? "bg-darkthemeitems" : "bg-whitetheme"}`}>
            <h1 className="text-2xl font-bold mb-4">{t('paymentSettings.title')}</h1>

            <div className="flex flex-col gap-4">
                <label className="flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={enablePayment}
                        onChange={() => setEnablePayment(prev => !prev)}
                        className="sr-only"
                    />
                    <span className={`flex items-center justify-center w-6 h-6 border rounded-md mr-2 transition-all duration-200 ${enablePayment ? 'bg-greentheme border-greentheme' : 'border-gray-300 dark:border-darkthemeitems'}`}>
                        {enablePayment && <Check size={16} className="text-white" />}
                    </span>
                    <span className="capitalize select-none text-lg font-semibold">{t('settingsPage.widget.payment.enable')}</span>
                </label>

                {enablePayment && (
                    <div className="animate-fadeIn space-y-6">
                        <div className="flex gap-6">
                            <label className="flex items-center cursor-pointer">
                                <input type="radio" name="paymentMode" value="always" checked={paymentMode === 'always'} onChange={() => setPaymentMode('always')} className="sr-only" />
                                <span className="ml-2">{t('paymentSettings.alwaysRequire')}</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input type="radio" name="paymentMode" value="rules" checked={paymentMode === 'rules'} onChange={() => setPaymentMode('rules')} className="sr-only" />
                                <span className="ml-2">{t('paymentSettings.useRules')}</span>
                            </label>
                        </div>

                        {paymentMode === 'always' && (
                            <div className="rounded-lg space-y-4 animate-fadeIn">
                                <p className="text-sm mb-4">{t('paymentSettings.alwaysDescription')}</p>
                                <div className="flex flex-col gap-4">
                                    <BaseInput
                                        label={t('settingsPage.widget.payment.minGuestsForPayment')}
                                        type="number"
                                        value={minGuestsForPayment?.toString()}
                                        onChange={(val) => setMinGuestsForPayment(Number(val) > 0 ? Number(val) : 1)}
                                        className="max-w-xs"
                                        variant="outlined"
                                    />
                                    <BaseInput
                                        label={t('settingsPage.widget.payment.depositAmountPerGuest')}
                                        type="number"
                                        value={depositAmountPerGuest?.toString()}
                                        onChange={(val) => setDepositAmountPerGuest(Number(val) >= 0 ? Number(val) : 0)}
                                        className="max-w-xs"
                                        variant="outlined"
                                    />
                                </div>
                            </div>
                        )}

                        {paymentMode === 'rules' && (
                            <div className="animate-fadeIn">
                                <div className="flex justify-end">
                                    <BaseBtn onClick={handleAddRule}><Plus size={16} /> {t('paymentSettings.addRule')}</BaseBtn>
                                </div>
                                <div className="overflow-x-auto w-full">
                                    <table className={`w-full border-collapse text-left text-sm ${isDarkMode ? "bg-bgdarktheme2" : "bg-white text-gray-500"}`}>
                                        <thead className={`${isDarkMode ? "bg-bgdarktheme text-white" : "bg-white text-gray-900"}`}>
                                            <tr>
                                                <th scope="col" className="px-6 py-4 font-medium">{t('paymentSettings.ruleName')}</th>
                                                <th scope="col" className="px-6 py-4 font-medium">{t('paymentSettings.status')}</th>
                                                <th scope="col" className="px-6 py-4 font-medium flex justify-end">{t('paymentSettings.actions')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className={`divide-y border-t ${isDarkMode ? "border-darkthemeitems divide-darkthemeitems" : "border-gray-200"}`}>
                                            {rules.map((rule) => (
                                                <tr key={rule.id} className={`${isDarkMode ? "hover:bg-bgdarktheme" : "hover:bg-gray-50"}`}>
                                                    <td className="px-6 py-4 font-medium cursor-pointer" onClick={() => handleEditRule(rule)}>{rule.name}</td>
                                                    <td className="px-6 py-4">
                                                        <label className="flex items-center cursor-pointer">
                                                            <input type="checkbox" checked={rule.status} onChange={() => handleToggleRuleStatus(rule.id)} className="sr-only" />
                                                            <span className={`w-10 h-5 rounded-full p-1 flex items-center transition-colors ${rule.status ? 'bg-greentheme' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                                                <span className={`w-3.5 h-3.5 bg-white rounded-full shadow-md transform transition-transform ${rule.status ? 'translate-x-5' : ''}`} />
                                                            </span>
                                                        </label>
                                                    </td>
                                                    <td className="px-6 py-4 flex justify-end gap-2">
                                                        <BaseBtn size="small" variant="secondary" onClick={() => handleEditRule(rule)}><Pencil size={15} /></BaseBtn>
                                                        <BaseBtn size="small" variant="secondary" className="!bg-softredtheme !text-redtheme hover:!bg-redtheme hover:!text-white" onClick={() => handleDeleteRule(rule.id)}><Trash size={15} /></BaseBtn>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {!enablePayment && (
                    <div className="pl-8 mt-2 animate-fadeIn">
                        <p className="text-sm text-orange-600 dark:text-orange-400 italic">
                            {t('settingsPage.widget.payment.disabledNote')}
                        </p>
                    </div>
                )}
            </div>
            <PaymentRuleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveRule} rule={editingRule} />
        </div>
    );
}