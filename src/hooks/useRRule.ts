import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RRuleOptions, RecurrenceRuleHolder, Weekday } from '../types/rrule';

export const useRRule = <T extends RecurrenceRuleHolder>(
    rule?: T,
    setRule?: React.Dispatch<React.SetStateAction<T>>,
) => {
    const { t } = useTranslation();
    const [endType, setEndType] = useState<'never' | 'on' | 'after'>('never');

    const isAdvanced = rule?.advanced !== null;

    useEffect(() => {
        if (rule?.advanced) {
            if (rule.endDate) setEndType('on');
            else if (rule.advanced.count) setEndType('after');
            else setEndType('never');
        } else {
            setEndType('never');
        }
    }, [rule?.advanced, rule?.endDate, rule?.advanced?.count]);

    const handleAdvancedToggle = (checked: boolean) => {
        if (checked) {
            const startDate = rule?.startDate || new Date().toISOString().split('T')[0];
            setRule?.(prev => ({
                ...prev,
                startDate: startDate,
                advanced: {
                    freq: 'WEEKLY',
                    interval: 1,
                    byweekday: [(new Date(startDate).toLocaleDateString('en-CA', { weekday: 'short' }).toUpperCase()) as Weekday]
                }
            }));
        } else {
            setRule?.(prev => ({ ...prev, advanced: null }));
        }
    };

    const handleRRuleChange = (field: keyof RRuleOptions, value: any) => {
        if (!rule?.advanced) return;
        setRule?.(prev => ({
            ...prev,
            advanced: { ...prev.advanced!, [field]: value }
        }));
    };

    const handleEndTypeChange = (type: 'never' | 'on' | 'after') => {
        setEndType(type);
        if (!rule?.advanced) return;

        setRule?.(prev => {
            const newAdvanced = { ...prev.advanced! };
            let newEndDate = prev.endDate;
            delete newAdvanced.count;

            if (type === 'on') {
                newEndDate = prev.endDate || new Date().toISOString().split('T')[0];
            } else if (type === 'after') {
                newAdvanced.count = newAdvanced.count || 1;
                newEndDate = '';
            } else { // never
                newEndDate = '';
            }
            return { ...prev, advanced: newAdvanced, endDate: newEndDate };
        });
    };

    const freqOptions = [
        { label: t('rrule.daily'), value: 'DAILY' },
        { label: t('rrule.weekly'), value: 'WEEKLY' },
        { label: t('rrule.monthly'), value: 'MONTHLY' },
        { label: t('rrule.yearly'), value: 'YEARLY' },
    ];

    const weekdayOptions: { label: string, value: Weekday }[] = [
        { label: t('calendarPopup.days.sunday'), value: 'SU' },
        { label: t('calendarPopup.days.monday'), value: 'MO' },
        { label: t('calendarPopup.days.tuesday'), value: 'TU' },
        { label: t('calendarPopup.days.wednesday'), value: 'WE' },
        { label: t('calendarPopup.days.thursday'), value: 'TH' },
        { label: t('calendarPopup.days.friday'), value: 'FR' },
        { label: t('calendarPopup.days.saturday'), value: 'SA' }
    ];

    const weekdayOptionsTranslation = {
        SU: t('common.days.sunday'),
        MO: t('common.days.monday'),
        TU: t('common.days.tuesday'),
        WE: t('common.days.wednesday'),
        TH: t('common.days.thursday'),
        FR: t('common.days.friday'),
        SA: t('common.days.saturday'),
    }

    const generateRecurrenceDescription = (rule: RecurrenceRuleHolder): string => {
        if (!rule) return '';

        if (rule.advanced) {
            const { freq, interval, byweekday, count } = rule.advanced;
            const endDate = rule.endDate;

            let recurrence = t(`rrule.everyX${interval > 1 ? 'Plural' : ''}`, { count: interval, unit: t(`rrule.freq_${freq}_${interval > 1 ? 'plural' : 'singular'}`).toLowerCase() });

            if (freq === 'WEEKLY' && byweekday && byweekday.length > 0) {
                const dayNames = byweekday.map((d: Weekday) => weekdayOptionsTranslation[d]).join(', ');
                recurrence += ` ${t('rrule.on')} ${dayNames}`;
            }

            let endCondition = '';
            if (endDate) {
                endCondition = t('rrule.untilDate', { date: endDate });
            } else if (count) {
                endCondition = t(`rrule.afterXOccurrences${count > 1 ? 'Plural' : ''}`, { count });
            }

            return `${recurrence}, ${t('rrule.startingFrom', { date: rule.startDate })} ${endCondition ? endCondition : ''}`.trim();

        } else {
            if (rule.startDate && rule.endDate) {
                if (rule.startDate === rule.endDate) {
                    return t('paymentSettings.description.onDate', { date: rule.startDate });
                } else {
                    return t('paymentSettings.description.fromToDate', { from: rule.startDate, to: rule.endDate });
                }
            } else if (rule.startDate) {
                return t('paymentSettings.description.onDate', { date: rule.startDate });
            }
        }
        return '';
    }

    const generatePaymentRuleDescription = (rule: any): string => {
        if (!rule) return '';

        const parts: string[] = [];

        // Deposit part
        parts.push(t('paymentSettings.description.deposit', {
            amount: rule.depositAmountPerGuest,
            count: rule.minGuestsForPayment
        }));

        // Time part
        if (rule.allDay) {
            parts.push(t('paymentSettings.description.allDay'));
        } else {
            parts.push(t('paymentSettings.description.fromToTime', { from: rule.fromTime, to: rule.toTime }));
        }

        // Date / Recurrence part
        parts.push(generateRecurrenceDescription(rule));

        return parts.filter(p => p).join(' ');
    };

    return {
        isAdvanced,
        endType,
        handleAdvancedToggle,
        handleRRuleChange,
        handleEndTypeChange,
        freqOptions,
        weekdayOptions,
        generateRecurrenceDescription,
        generatePaymentRuleDescription
    };
};