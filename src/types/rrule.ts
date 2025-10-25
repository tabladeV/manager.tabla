export type RRuleFreq = 'YEARLY' | 'MONTHLY' | 'WEEKLY' | 'DAILY';
export type Weekday = 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU';

export interface RRuleOptions {
    freq: RRuleFreq;
    interval: number;
    byweekday?: Weekday[];
    bymonthday?: number;
    bysetpos?: number;
    until?: string;
    count?: number;
}

/**
 * Interface for any object that can have recurrence rules.
 * The useRRule hook will expect an object that conforms to this.
 */
export interface RecurrenceRuleHolder {
    startDate: string;
    endDate: string;
    advanced?: RRuleOptions | null;
}

// Specific implementation for Payment Rules
export interface PaymentRule extends RecurrenceRuleHolder {
    id: number;
    name: string;
    status: boolean;
    allDay: boolean;
    fromTime: string;
    toTime: string;
    minGuestsForPayment: number;
    depositAmountPerGuest: number;
}