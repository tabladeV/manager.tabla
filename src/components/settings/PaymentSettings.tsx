"use client"
import React, { useState, useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useDarkContext } from "../../context/DarkContext"
import { Check, Plus, Trash, Pencil, X } from "lucide-react"
import BaseBtn from "../common/BaseBtn"
import Portal from "../common/Portal"
import BaseInput from "../common/BaseInput"
import BaseTimeInput from "../common/BaseTimeInput"
import { useRRule } from "../../hooks/useRRule"
import { PaymentRule } from "../../types/rrule"
import { useList, useUpdate, useCreate, useDelete, useOne, BaseKey } from "@refinedev/core"

interface PaymentRuleModalProps {
    isOpen: boolean
    loadingUpdateRule?: boolean
    loadingCreateRule?: boolean
    onClose: () => void
    onSave: (rule: PaymentRule) => void
    rule: PaymentRule | null
}

const defaultRuleState: Omit<PaymentRule, 'id'> = {
    name: '',
    status: true,
    startDate: '',
    endDate: '',
    allDay: false,
    fromTime: '12:00',
    toTime: '21:00',
    minGuestsForPayment: 1,
    depositAmountPerGuest: 10,
    advanced: null
};

// Modal Component
const PaymentRuleModal: React.FC<PaymentRuleModalProps> = ({ isOpen, onClose, onSave, rule, loadingUpdateRule, loadingCreateRule }) => {
    const { t } = useTranslation();
    const [currentRule, setCurrentRule] = useState<PaymentRule>({ ...defaultRuleState, id: Date.now() });

    const {
        generatePaymentRuleDescription
    } = useRRule(currentRule, setCurrentRule);

    const isFormValid = useMemo(() => {
        if (!currentRule.name.trim()) return false;
        if (!currentRule.minGuestsForPayment || !currentRule.depositAmountPerGuest) return false;
        if (!currentRule.startDate || !currentRule.endDate) return false;
        if (currentRule.startDate && currentRule.endDate && currentRule.startDate > currentRule.endDate) return false;
        return true;
    }, [currentRule]);

    useEffect(() => {
        if (isOpen) {
            if (rule) {
                setCurrentRule(rule);
            } else {
                setCurrentRule({ ...defaultRuleState, id: 0 }); // Use 0 or another indicator for a new rule
            }
        }
    }, [rule, isOpen]);

    const handleSave = () => {
        if (!isFormValid) {
            return;
        }
        onSave(currentRule);
    };

    if (!isOpen) return null;

    return (
        <Portal>
            <div className="overlay glassmorphism" onClick={onClose}></div>
            <div className={`sidepopup lt-sm:popup lt-sm:h-auto lt-sm:bottom-0 lt-sm:rounded-b-none lt-sm:w-full h-full pa-0 dark:bg-bgdarktheme bg-white`}>
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">{rule ? t('paymentSettings.editRule') : t('paymentSettings.addRule')}</h1>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-softgreytheme dark:hover:bg-darkthemeitems">
                        <X size={20} />
                    </button>
                </div>
                <div className="flex flex-col gap-4 pb-16 overflow-auto">
                    <p className="w-full sticky top-0 z-10 shadow dark:bg-bgdarktheme bg-white pb-2" >{generatePaymentRuleDescription(currentRule)}</p>
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
                            label={t('export.minGuests')}
                            type="number"
                            value={currentRule.minGuestsForPayment?.toString() || ''}
                            rules={[(value)=> !!value? null : t('common.validation.requiredField')]}
                            onChange={(val) => setCurrentRule({ ...currentRule, minGuestsForPayment: Number(val) > 0 ? Number(val) : null })}
                            variant="outlined"
                        />
                        <BaseInput
                            label={t('settingsPage.widget.payment.depositAmountPerGuest')}
                            type="number"
                            value={currentRule.depositAmountPerGuest?.toString() || ''}
                            rules={[(value)=> !!value? null : t('common.validation.requiredField')]}
                            onChange={(val) => setCurrentRule({ ...currentRule, depositAmountPerGuest: Number(val) > 0 ? Number(val) : null })}
                            variant="outlined"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <BaseInput label={t('paymentSettings.startDate')} type="date" value={currentRule.startDate} onChange={(val) => setCurrentRule({ ...currentRule, startDate: val })} rules={[(value)=> !!value? null : t('common.validation.requiredField') ,(value) => (currentRule.endDate && value > currentRule.endDate) ? t('paymentSettings.errors.startDateAfterEnd') : null,]} variant="outlined" />
                        <BaseInput label={t('paymentSettings.endDate')} type="date" value={currentRule.endDate} onChange={(val) => setCurrentRule({ ...currentRule, endDate: val })} rules={[(value)=> !!value? null : t('common.validation.requiredField') ,(value) => (currentRule.startDate && value < currentRule.startDate) ? t('paymentSettings.errors.endDateBeforeStart') : null,]} variant="outlined" />
                    </div>
                    {/* <label className="flex items-center cursor-pointer">
                        <input type="checkbox" checked={currentRule.allDay} onChange={(e) => setCurrentRule({ ...currentRule, allDay: e.target.checked })} className="sr-only" />
                        <span className={`flex items-center justify-center w-5 h-5 border rounded-md mr-2 transition-all duration-200 ${currentRule.allDay ? 'bg-greentheme border-greentheme' : 'border-gray-300 dark:border-darkthemeitems'}`}>
                            {currentRule.allDay && <Check size={14} className="text-white" />}
                        </span>
                        <span className="select-none">{t('paymentSettings.allDay')}</span>
                    </label>
                    {!currentRule.allDay && (
                        <div className="grid grid-cols-2 gap-4 animate-fadeIn">
                            <BaseTimeInput label={t('paymentSettings.fromTime')} value={currentRule.fromTime} onChange={(val) => setCurrentRule({ ...currentRule, fromTime: val || '' })} variant="outlined" clearable={false} />
                            <BaseTimeInput label={t('paymentSettings.toTime')} value={currentRule.toTime} onChange={(val) => setCurrentRule({ ...currentRule, toTime: val || '' })} variant="outlined" clearable={false} />
                        </div>
                    )} */}

                    {/* <label className="flex items-center cursor-pointer mt-2">
                        <input type="checkbox" checked={isAdvanced} onChange={(e) => handleAdvancedToggle(e.target.checked)} className="sr-only" />
                        <span className={`flex items-center justify-center w-5 h-5 border rounded-md mr-2 transition-all duration-200 ${isAdvanced ? 'bg-greentheme border-greentheme' : 'border-gray-300 dark:border-darkthemeitems'}`}>
                            {isAdvanced && <Check size={14} className="text-white" />}
                        </span>
                        <span className="select-none">{t('paymentSettings.advanced')}</span>
                    </label>

                    {isAdvanced && currentRule.advanced && (
                        <div className="p-4 rounded-lg border border-gray-200 dark:border-darkthemeitems space-y-4 animate-fadeIn">
                            <div className="flex items-center gap-2">
                                <span className="whitespace-nowrap">{t('rrule.repeatEvery')}</span>
                                <BaseInput type="number" value={currentRule.advanced.interval.toString()} onChange={val => handleRRuleChange('interval', Number(val) > 0 ? Number(val) : 1)} className="w-20" variant="outlined" dense />
                                <BaseSelect options={freqOptions} value={currentRule.advanced.freq} onChange={val => handleRRuleChange('freq', val as RRuleFreq)} variant="outlined" clearable={false} />
                            </div>

                            {currentRule.advanced.freq === 'WEEKLY' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('rrule.repeatOn')}</label>
                                    <div className="flex justify-center gap-1">
                                        {weekdayOptions.map(day => (
                                            <button key={day.value} onClick={() => {
                                                const currentDays = currentRule.advanced?.byweekday || [];
                                                const newDays = currentDays.includes(day.value) ? currentDays.filter(d => d !== day.value) : [...currentDays, day.value];
                                                handleRRuleChange('byweekday', newDays);
                                            }} className={`w-8 h-8 rounded-full text-xs flex items-center justify-center transition-colors ${(currentRule.advanced?.byweekday || []).includes(day.value) ? 'bg-greentheme text-white' : 'bg-softgreytheme dark:bg-darkthemeitems'}`}>
                                                {day.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('rrule.ends')}</label>
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <input type="radio" name="endType" checked={endType === 'never'} onChange={() => handleEndTypeChange('never')} className="mr-2" />
                                        <span>{t('rrule.never')}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <input type="radio" name="endType" checked={endType === 'on'} onChange={() => handleEndTypeChange('on')} className="mr-2" />
                                        <span>{t('rrule.on')}</span>
                                        <BaseInput
                                            type="date"
                                            value={currentRule.endDate}
                                            onChange={(val) => setCurrentRule({ ...currentRule, endDate: val })}
                                            variant="outlined"
                                            className="ml-2 w-40"
                                            disabled={endType !== 'on'}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="radio" name="endType" checked={endType === 'after'} onChange={() => handleEndTypeChange('after')} className="mr-2" />
                                        <span className="whitespace-nowrap">{t('rrule.after')}</span>
                                        <BaseInput type="number" value={(currentRule.advanced.count || 1).toString()} onChange={val => handleRRuleChange('count', Number(val) > 0 ? Number(val) : 1)} disabled={endType !== 'after'} className="w-20" variant="outlined" dense />
                                        <span>{t('rrule.occurrences')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )} */}
                </div>
                <div className="flex justify-end gap-2 mt-4 absolute bottom-[10px] right-[40px] w-[calc(100%-20px)]">
                    <BaseBtn variant="outlined" onClick={onClose}>{t('common.cancel')}</BaseBtn>
                    <BaseBtn onClick={handleSave} disabled={!isFormValid} loading={loadingUpdateRule || loadingCreateRule}>{t('common.save')}</BaseBtn>
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
    const [rules, setRules] = useState<PaymentRule[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<PaymentRule | null>(null);
    const { generatePaymentRuleDescription } = useRRule();
    const restaurantId = localStorage.getItem('restaurant_id') || '1';

    // State for 'Always' mode
    const [minGuestsForPayment, setMinGuestsForPayment] = useState<number | null>(1);
    const [depositAmountPerGuest, setDepositAmountPerGuest] = useState<number | null>(10);

    // State to track initial settings for change detection
    const [initialSettings, setInitialSettings] = useState<any>(null);

    // API Hooks for Payment Settings
    const { data: settingsData, refetch: refetchSettings } = useOne({
        resource: "api/v1/bo/payments/settings",
        id: "1/", // Placeholder ID
    });

    const { mutate: updateSettings } = useUpdate();

    // API Hooks for Payment Rules
    const { data: rulesData, refetch: refetchRules } = useList({
        resource: "api/v1/bo/payments/rules/",
        pagination: { pageSize: 100 },
        queryOptions: {
            enabled: paymentMode === 'rules',
        }
    });
    const { mutate: createRule, isLoading: loadingCreateRule } = useCreate();
    const { mutate: updateRule, isLoading: loadingUpdateRule } = useUpdate();
    const { mutate: deleteRule, isLoading: loadingDeleteRule } = useDelete();

    const isValidSettingsForm = useMemo(() => {
        return (
            minGuestsForPayment !== null &&
            depositAmountPerGuest !== null
        );
    }, [minGuestsForPayment, depositAmountPerGuest]);

    // Effect to load settings from API
    useEffect(() => {
        if (settingsData?.data) {
            const data = settingsData.data as any;
            const loadedSettings = {
                enablePayment: data.enable_paymant,
                paymentMode: data.payment_mode,
                minGuestsForPayment: data.min_guests_for_payment,
                depositAmountPerGuest: parseFloat(data.deposit_amount_par_guest)
            };
            setEnablePayment(loadedSettings.enablePayment);
            setPaymentMode(loadedSettings.paymentMode);
            setMinGuestsForPayment(loadedSettings.minGuestsForPayment);
            setDepositAmountPerGuest(loadedSettings.depositAmountPerGuest);
            setInitialSettings(loadedSettings);
        }
    }, [settingsData]);

    // Effect to load rules from API
    useEffect(() => {
        if (rulesData?.data) {
            const apiRules = (rulesData.data as any).results.map((rule: any) => ({
                id: rule.id,
                name: rule.name,
                status: rule.is_enbaled,
                startDate: rule.start_date,
                endDate: rule.end_date,
                fromTime: rule.from_time?.substring(0, 5) || "",
                toTime: rule.to_time?.substring(0, 5) || "",
                minGuestsForPayment: rule.min_guests_for_payment,
                depositAmountPerGuest: parseFloat(rule.deposit_amount_par_guest),
                allDay: rule.all_day,
                advanced: null
            }));
            setRules(apiRules);
        }
    }, [rulesData]);

    const haveSettingsChanged = useMemo(() => {
        if (!initialSettings) return false;
        return (
            initialSettings.enablePayment !== enablePayment ||
            initialSettings.paymentMode !== paymentMode ||
            initialSettings.minGuestsForPayment !== minGuestsForPayment ||
            initialSettings.depositAmountPerGuest !== depositAmountPerGuest
        );
    }, [initialSettings, enablePayment, paymentMode, minGuestsForPayment, depositAmountPerGuest]);

    const handleSaveSettings = () => {
        updateSettings({
            resource: "api/v1/bo/payments/settings",
            id: "1/",
            values: {
                enable_paymant: enablePayment,
                payment_mode: paymentMode,
                min_guests_for_payment: minGuestsForPayment,
                deposit_amount_par_guest: depositAmountPerGuest?.toString(),
                restaurant: restaurantId
            },
        }, {
            onSuccess: (data) => {
                // After successful save, update the initial settings to match the current state
                const savedData = data.data as any;
                const newInitialSettings = {
                    enablePayment: savedData.enable_paymant,
                    paymentMode: savedData.payment_mode,
                    minGuestsForPayment: savedData.min_guests_for_payment,
                    depositAmountPerGuest: parseFloat(savedData.deposit_amount_par_guest)
                };
                setInitialSettings(newInitialSettings);
            }
        });
    };

    const handleAddRule = () => {
        setEditingRule(null);
        setIsModalOpen(true);
    };

    const handleEditRule = (rule: PaymentRule) => {
        setEditingRule(rule);
        setIsModalOpen(true);
    };

    const handleDeleteRule = (id: BaseKey) => {
        deleteRule({
            resource: "api/v1/bo/payments/rules",
            id: `${id}/`,
        }, {
            onSuccess: () => refetchRules(),
        });
    };

    const handleSaveRule = (rule: PaymentRule) => {
        const values = {
            name: rule.name,
            is_enbaled: rule.status,
            start_date: rule.startDate || null,
            end_date: rule.endDate || null,
            from_time: rule.allDay ? '10:00' : `${rule.fromTime}:00`,
            to_time: rule.allDay ? '22:00' : `${rule.toTime}:00`,
            min_guests_for_payment: rule.minGuestsForPayment,
            deposit_amount_par_guest: rule.depositAmountPerGuest?.toString() || 0,
            all_day: rule.allDay,
            restaurant: restaurantId
        };

        if (rule.id && rule.id !== 0) {
            updateRule({
                resource: "api/v1/bo/payments/rules",
                id: `${rule.id}/`,
                values,
                errorNotification(error, values, resource) {
                    return {
                        type: "error",
                        message: error?.formattedMessage,
                    }
                },
            }, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    refetchRules();
                },
            });
        } else {
            createRule({
                resource: "api/v1/bo/payments/rules/",
                values,
                errorNotification(error, values, resource) {
                    return {
                        type: "error",
                        message: error?.formattedMessage,
                    }
                },
            }, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    refetchRules();
                },
            });
        }
    };

    const handleToggleRuleStatus = (ruleToToggle: PaymentRule) => {
        updateRule({
            resource: "api/v1/bo/payments/rules",
            id: `${ruleToToggle.id}/`,
            values: { is_enbaled: !ruleToToggle.status }
        }, {
            onSuccess: () => refetchRules(),
        });
    };

    return (
        <div className={`w-full rounded-[10px] p-4 ${isDarkMode ? "bg-bgdarktheme" : "bg-white"}`}>
            <div className="flex justify-between items-start mb-4">
                <h1 className="text-2xl font-bold">{t('paymentSettings.title')}</h1>
            </div>

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
                                        value={minGuestsForPayment?.toString() || ''}
                                        rules={[(value)=> !!value? null : t('common.validation.requiredField')]}
                                        onChange={(val) => setMinGuestsForPayment(Number(val) > 0 ? Number(val) : null)}
                                        className="max-w-xs"
                                        variant="outlined"
                                    />
                                    <BaseInput
                                        label={t('settingsPage.widget.payment.depositAmountPerGuest')}
                                        type="number"
                                        value={depositAmountPerGuest?.toString() || ''}
                                        rules={[(value)=> !!value? null : t('common.validation.requiredField')]}
                                        onChange={(val) => setDepositAmountPerGuest(Number(val) >= 0 ? Number(val) : null)}
                                        className="max-w-xs"
                                        variant="outlined"
                                    />
                                </div>
                            </div>
                        )}
                        <div className="flex gap-6 justify-center">
                            {haveSettingsChanged && (
                                        <BaseBtn onClick={handleSaveSettings} disabled={!isValidSettingsForm} className="animate-fadeIn w-1/4">
                                            {t('common.save')}
                                        </BaseBtn>
                                    )}
                        </div>

                        {paymentMode === 'rules' && (
                            <div className="animate-fadeIn">
                                <div className="flex justify-end">
                                    <BaseBtn onClick={handleAddRule}><Plus size={16} /> {t('paymentSettings.addRule')}</BaseBtn>
                                </div>
                                <div className="overflow-x-auto w-full mt-4">
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
                                                    <td className="px-6 py-4 font-medium cursor-pointer" onClick={() => handleEditRule(rule)}>
                                                        <div className="font-medium text-gray-900 dark:text-white">{rule.name}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{generatePaymentRuleDescription(rule)}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <label className="flex items-center cursor-pointer">
                                                            <input type="checkbox" checked={rule.status} onChange={() => handleToggleRuleStatus(rule)} className="sr-only" />
                                                            <span className={`w-10 h-5 rounded-full p-1 flex items-center transition-colors ${rule.status ? 'bg-greentheme' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                                                <span className={`w-3.5 h-3.5 bg-white rounded-full shadow-md transform transition-transform ${rule.status ? 'translate-x-5' : ''}`} />
                                                            </span>
                                                        </label>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button className="btn-secondary p-2" onClick={() => handleEditRule(rule)}><Pencil size={15} /></button>
                                                            <button className="btn-secondary bg-softredtheme text-redtheme hover:bg-redtheme hover:text-white p-2" onClick={() => handleDeleteRule(rule.id)}><Trash size={15} /></button>
                                                        </div>
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
                    <>
                    <div className="pl-8 mt-2 animate-fadeIn">
                        <p className="text-sm text-orange-600 dark:text-orange-400 italic">
                            {t('settingsPage.widget.payment.disabledNote')}
                        </p>
                    </div>
                    <div className="flex gap-6 justify-center">
                            {haveSettingsChanged && (
                                        <BaseBtn onClick={handleSaveSettings} disabled={!isValidSettingsForm} className="animate-fadeIn w-1/4">
                                            {t('common.save')}
                                        </BaseBtn>
                                    )}
                        </div>
                    </>
                )}
            </div>
            <PaymentRuleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveRule} rule={editingRule} loadingUpdateRule={loadingUpdateRule} loadingCreateRule={loadingCreateRule} />
        </div>
    );
}