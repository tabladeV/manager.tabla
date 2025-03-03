import { useTranslation } from 'react-i18next';

export interface Column {
    key: string;
    label: string;
}

export interface CustomFieldOption {
    value: string;
    label: string;
}

export interface CustomField {
    key: string;
    label: string;
    input: 'text' | 'number' | 'checkbox' | 'radio' | 'select';
    options?: CustomFieldOption[];
    defaultValue?: string | number | boolean;
    children?: CustomField[];
    showChildrenWhen?: {
        value: any;
        condition?: 'equals' | 'notEquals' | 'includes' | 'truthy' | 'falsy';
    };
}

/**
 * Provides simplified export configurations for different data types
 */
export const useExportConfig = () => {
    const { t } = useTranslation();

    // =============================================
    // Columns for different export types
    // =============================================

    // Guest feedback/reviews columns
    const reviewColumns: Column[] = [
        { key: 'id', label: t('reviews.tableHeaders.id', 'ID') },
        { key: 'name', label: t('reviews.tableHeaders.name', 'Guest Name') },
        { key: 'comment', label: t('reviews.tableHeaders.comment', 'Comment') },
        { key: 'food', label: t('reviews.tableHeaders.food', 'Food Rating') },
        { key: 'service', label: t('reviews.tableHeaders.service', 'Service Rating') },
        { key: 'environment', label: t('reviews.tableHeaders.environment', 'Environment Rating') },
        { key: 'valueForMoney', label: t('reviews.tableHeaders.valueForMoney', 'Value for Money') },
        { key: 'total', label: t('reviews.tableHeaders.total', 'Overall Rating') },
        { key: 'date', label: t('reviews.tableHeaders.date', 'Date') }
    ];

    // Customer/guest profile columns
    const customerColumns: Column[] = [
        { key: 'id', label: t('customers.tableHeaders.id', 'ID') },
        { key: 'firstName', label: t('customers.tableHeaders.firstName', 'First Name') },
        { key: 'lastName', label: t('customers.tableHeaders.lastName', 'Last Name') },
        { key: 'fullName', label: t('customers.tableHeaders.fullName', 'Full Name') },
        { key: 'email', label: t('customers.tableHeaders.email', 'Email') },
        { key: 'phoneNumber', label: t('customers.tableHeaders.phoneNumber', 'Phone Number') },
        { key: 'notes', label: t('customers.tableHeaders.notes', 'Notes') },
        { key: 'reservationCount', label: t('customers.tableHeaders.reservationCount', 'Reservation Count') }
    ];

    // Reservation columns
    const reservationColumns: Column[] = [
        { key: 'id', label: t('reservations.tableHeaders.id', 'ID') },
        { key: 'fullName', label: t('reservations.tableHeaders.fullName', 'Guest Name') },
        { key: 'email', label: t('reservations.tableHeaders.email', 'Email') },
        { key: 'phone', label: t('reservations.tableHeaders.phone', 'Phone') },
        { key: 'comment', label: t('reservations.tableHeaders.comment', 'Comment') },
        { key: 'table', label: t('reservations.tableHeaders.table', 'Table') },
        { key: 'date', label: t('reservations.tableHeaders.date', 'Date') },
        { key: 'time', label: t('reservations.tableHeaders.time', 'Time') },
        { key: 'guests', label: t('reservations.tableHeaders.guests', 'Guests') },
        { key: 'status', label: t('reservations.tableHeaders.status', 'Status') },
        { key: 'source', label: t('reservations.tableHeaders.source', 'Source') }
    ];

    // =============================================
    // Custom fields for different export types
    // =============================================

    // Guest feedback/reviews custom fields
    const reviewCustomFields: CustomField[] = [
        {
            key: 'dateRange',
            label: t('export.dateRange', 'Date Range'),
            input: 'radio',
            options: [
                { value: 'all', label: t('export.all', 'All Time') },
                { value: 'lastMonth', label: t('export.lastMonth', 'Last Month') },
                { value: 'last3Months', label: t('export.last3Months', 'Last 3 Months') },
                { value: 'custom', label: t('export.custom', 'Custom Range') }
            ],
            defaultValue: 'all',
            children: [
                {
                    key: 'startDate',
                    label: t('export.startDate', 'Start Date'),
                    input: 'text',
                    defaultValue: ''
                },
                {
                    key: 'endDate',
                    label: t('export.endDate', 'End Date'),
                    input: 'text',
                    defaultValue: ''
                }
            ],
            showChildrenWhen: { value: 'custom', condition: 'equals' }
        },
        {
            key: 'includeStats',
            label: t('export.includeStats', 'Include Basic Statistics'),
            input: 'checkbox',
            defaultValue: true
        }
    ];

    // Customer/guest profile custom fields
    const customerCustomFields: CustomField[] = [
        // {
        //     key: 'includeVisitHistory',
        //     label: t('export.includeVisitHistory', 'Include Visit History'),
        //     input: 'checkbox',
        //     defaultValue: false
        // },
        // {
        //     key: 'includeReviewsCount',
        //     label: t('export.includeReviewsCount', 'Include Reviews Count'),
        //     input: 'checkbox',
        //     defaultValue: true
        // }
    ];

    // Reservation custom fields
    const reservationCustomFields: CustomField[] = [
        // {
        //     key: 'dateRange',
        //     label: t('export.dateRange', 'Date Range'),
        //     input: 'radio',
        //     options: [
        //         { value: 'upcoming', label: t('export.upcoming', 'Upcoming Reservations') },
        //         { value: 'past', label: t('export.past', 'Past Reservations') },
        //         { value: 'all', label: t('export.all', 'All Reservations') },
        //         { value: 'custom', label: t('export.custom', 'Custom Range') }
        //     ],
        //     defaultValue: 'upcoming',
        //     children: [
        //         {
        //             key: 'startDate',
        //             label: t('export.startDate', 'Start Date'),
        //             input: 'text',
        //             defaultValue: ''
        //         },
        //         {
        //             key: 'endDate',
        //             label: t('export.endDate', 'End Date'),
        //             input: 'text',
        //             defaultValue: ''
        //         }
        //     ],
        //     showChildrenWhen: { value: 'custom', condition: 'equals' }
        // },
        {
            key: 'includeTableUsage',
            label: t('export.includeTableUsage', 'Include Table Usage Summary'),
            input: 'checkbox',
            defaultValue: true
        },
        {
            key: 'includeReservationStatus',
            label: 'Reservation Status',
            input: 'checkbox',
            defaultValue: true
        },
        {
            key: 'includeReservationSource',
            label: 'Reservation Status',
            input: 'checkbox',
            defaultValue: true
        },
        // {
        //     key: 'statusFilter',
        //     label: t('export.statusFilter', 'Reservation Status'),
        //     input: 'select',
        //     options: [
        //         { value: 'all', label: t('export.all', 'All Statuses') },
        //         { value: 'pending', label: t('export.pending', 'Pending') },
        //         { value: 'confirmed', label: t('export.confirmed', 'Confirmed') },
        //         { value: 'seated', label: t('export.seated', 'Seated') },
        //         { value: 'fulfilled', label: t('export.fulfilled', 'Fulfilled') },
        //         { value: 'cancelled', label: t('export.cancelled', 'Cancelled') },
        //         { value: 'noShow', label: t('export.noShow', 'No Show') }
        //     ],
        //     defaultValue: 'all'
        // },
        // {
        //     key: 'reservationSource',
        //     label: t('export.reservationSource', 'Reservation Source'),
        //     input: 'select',
        //     options: [
        //         { value: 'all', label: t('export.all', 'All Sources') },
        //         { value: 'website', label: t('export.website', 'Website') },
        //         { value: 'phone', label: t('export.phone', 'Phone') },
        //         { value: 'walkIn', label: t('export.walkIn', 'Walk-In') },
        //         { value: 'thirdParty', label: t('export.thirdParty', 'Third-Party') }
        //     ],
        //     defaultValue: 'all'
        // }
    ];

    // Returns all the export configurations
    return {
        reviews: {
            columns: reviewColumns,
            customFields: reviewCustomFields
        },
        customers: {
            columns: customerColumns,
            customFields: customerCustomFields
        },
        reservations: {
            columns: reservationColumns,
            customFields: reservationCustomFields
        },
    };
};

export default useExportConfig;