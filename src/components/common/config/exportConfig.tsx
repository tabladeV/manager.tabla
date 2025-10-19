import { useTranslation } from 'react-i18next';

export type InputType = 'text' | 'number' | 'checkbox' | 'radio' | 'select' | 'date' | 'checkboxGroup';

export interface Column {
    key: string;
    label: string;
}

export interface CustomFieldOption {
    value: any;
    label: string;
}

export interface CustomField {
    key: string;
    label: string;
    input: InputType;
    options?: CustomFieldOption[];
    defaultValue?: string | number | boolean | string[] | number[] | boolean[];
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
        { key: 'seq_id', label: t('reviews.tableHeaders.id', 'ID') },
        { key: 'customer_name', label: t('reviews.tableHeaders.customerName', 'Customer Name') },
        // { key: 'rating', label: t('reviews.tableHeaders.rating', 'Rating') },
        // { key: 'comment', label: t('reviews.tableHeaders.comment', 'Comment') },
        { key: 'short_comment', label: t('reviews.tableHeaders.shortComment', 'Short Comment') },
        { key: 'created_at', label: t('reviews.tableHeaders.createdAt', 'Date') },
        { key: 'value_for_money', label: t('reviews.tableHeaders.valueForMoney', 'Value for Money') },
        { key: 'service_rating', label: t('reviews.tableHeaders.serviceRating', 'Service Rating') },
        { key: 'source', label: t('reviews.tableHeaders.source', 'Source') },
        { key: 'food_rating', label: t('reviews.tableHeaders.foodRating', 'Food Rating') },
        { key: 'ambience_rating', label: t('reviews.tableHeaders.ambienceRating', 'Ambience Rating') },
    ];

    // Customer/guest profile columns
    const customerColumns: Column[] = [
        { key: 'seq_id', label: t('customers.tableHeaders.id', 'ID') },
        { key: 'full_name', label: t('customers.tableHeaders.fullName', 'Full Name') },
        { key: 'first_name', label: t('customers.tableHeaders.firstName', 'First Name') },
        { key: 'last_name', label: t('customers.tableHeaders.lastName', 'Last Name') },
        { key: 'email', label: t('customers.tableHeaders.email', 'Email') },
        { key: 'phone', label: t('customers.tableHeaders.phoneNumber', 'Phone Number') },
        { key: 'title', label: t('customers.tableHeaders.title', 'Title') },
        { key: 'internal_note', label: t('customers.tableHeaders.notes', 'Notes') },
        { key: 'reservation_count', label: t('customers.tableHeaders.reservationCount', 'Reservation Count') },
        { key: 'created_at', label: t('customers.tableHeaders.createdAt', 'Created At') },
        { key: 'updated_at', label: t('customers.tableHeaders.updatedAt', 'Updated At') },
    ];

    // Reservation columns
    const reservationColumns: Column[] = [
        { key: 'seq_id', label: t('reservations.tableHeaders.id', 'ID') },
        { key: 'date', label: t('reservations.tableHeaders.date', 'Date') },
        { key: 'time', label: t('reservations.tableHeaders.time', 'Time') },
        { key: 'number_of_guests', label: t('reservations.tableHeaders.numberOfGuests', 'Number of Guests') },
        { key: 'customer', label: t('reservations.tableHeaders.customer', 'Customer') },
        { key: 'email', label: t('reservations.tableHeaders.email', 'Email') },
        { key: 'phone', label: t('reservations.tableHeaders.phone', 'Phone') },
        { key: 'status', label: t('reservations.tableHeaders.status', 'Status') },
        { key: 'source', label: t('reservations.tableHeaders.source', 'Source') },
        { key: 'comment', label: t('reservations.tableHeaders.comment', 'Comment') },
        { key: 'internal_note', label: t('reservations.edit.informations.internalNote', 'Internal Note') },
        { key: 'tables', label: t('reservations.tableHeaders.tables', 'Tables') },
        { key: 'created_at', label: t('customers.tableHeaders.createdAt', 'Created At') },
        { key: 'updated_at', label: t('customers.tableHeaders.updatedAt', 'Updated At') },
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
                { value: 'custom', label: t('export.custom', 'Custom Range') }
            ],
            defaultValue: 'all',
            children: [
                {
                    key: 'created_at__gte',
                    label: t('export.startDate', 'Start Date'),
                    input: 'date',
                    defaultValue: ''
                },
                {
                    key: 'created_at__lte',
                    label: t('export.endDate', 'End Date'),
                    input: 'date',
                    defaultValue: ''
                }
            ],
            showChildrenWhen: { value: 'custom', condition: 'equals' }
        },
        {
            key: 'ratings',
            label: t('export.filterByRating', 'Filter by Rating'),
            input: 'checkboxGroup',
            options: [
                { value: 5, label: '5 Stars' },
                { value: 4, label: '4 Stars' },
                { value: 3, label: '3 Stars' },
                { value: 2, label: '2 Stars' },
                { value: 1, label: '1 Star' },
            ],
            defaultValue: [5]
        },
        {
            key: 'includeRatingStats',
            label: t('export.includeRatingStats', 'Include Rating Statistics'),
            input: 'checkbox',
            defaultValue: false
        },
        {
            key: 'async',
            label: t('export.asyncGeneration', 'Notify me when the export is ready'),
            input: 'checkbox',
            defaultValue: false,
            children: [
                {
                    key: 'email',
                    label: t('export.notificationEmail', 'Notification Email'),
                    input: 'text',
                    defaultValue: ''
                }
            ],
            showChildrenWhen: { value: true, condition: 'truthy' }
        }
    ];

    // Customer/guest profile custom fields
    const customerCustomFields: CustomField[] = [
        {
            key: 'dateRange',
            label: t('export.dateRange', 'Date Range'),
            input: 'radio',
            options: [
                { value: 'all', label: t('export.all', 'All Time') },
                { value: 'custom', label: t('export.custom', 'Custom Range') }
            ],
            defaultValue: 'all',
            children: [
                {
                    key: 'created_at__gte',
                    label: t('export.startDate', 'Start Date'),
                    input: 'date',
                    defaultValue: ''
                },
                {
                    key: 'created_at__lte',
                    label: t('export.endDate', 'End Date'),
                    input: 'date',
                    defaultValue: ''
                }
            ],
            showChildrenWhen: { value: 'custom', condition: 'equals' }
        },
        {
            key: 'title',
            label: t('export.title', 'Title'),
            input: 'select',
            options: [
                { value: '', label: t('export.all', 'All Titles') },
                { value: 'MR', label: 'Mr.' },
                { value: 'MRS', label: 'Mrs.' },
                { value: 'MS', label: 'Ms.' },
            ],
            defaultValue: ''
        },
        {
            key: 'is_active',
            label: t('export.isActive', 'Active Status'),
            input: 'select',
            options: [
                { value: 'all', label: t('export.all', 'All') },
                { value: 'true', label: t('export.active', 'Active') },
                { value: 'false', label: t('export.inactive', 'Inactive') },
            ],
            defaultValue: 'all'
        },
        {
            key: 'includeTitleStats',
            label: t('export.includeTitleStats', 'Include Title Statistics'),
            input: 'checkbox',
            defaultValue: false
        },
        {
            key: 'async',
            label: t('export.asyncGeneration', 'Notify me when the export is ready'),
            input: 'checkbox',
            defaultValue: false,
            children: [
                {
                    key: 'email',
                    label: t('export.notificationEmail', 'Notification Email'),
                    input: 'text',
                    defaultValue: ''
                }
            ],
            showChildrenWhen: { value: true, condition: 'truthy' }
        }
    ];

    // Reservation custom fields
    const reservationCustomFields: CustomField[] = [
        {
            key: 'dateRange',
            label: t('export.dateRange', 'Date Range'),
            input: 'radio',
            options: [
                { value: 'all', label: t('export.all', 'All Time') },
                { value: 'custom', label: t('export.custom', 'Custom Range') }
            ],
            defaultValue: 'all',
            children: [
                {
                    key: 'date__gte',
                    label: t('export.startDate', 'Start Date'),
                    input: 'date',
                    defaultValue: ''
                },
                {
                    key: 'date__lte',
                    label: t('export.endDate', 'End Date'),
                    input: 'date',
                    defaultValue: ''
                }
            ],
            showChildrenWhen: { value: 'custom', condition: 'equals' }
        },
        {
            key: 'status',
            label: t('export.statusFilter', 'Reservation Status'),
            input: 'select',
            options: [
                { value: '', label: t('export.all', 'All Statuses') },
                { value: 'PENDING', label: t('reservations.statusLabels.pending', 'Pending') },
                { value: 'APPROVED', label: t('reservations.statusLabels.confirmed', 'Confirmed') },
                { value: 'SEATED', label: t('reservations.statusLabels.seated', 'Seated') },
                { value: 'FULFILLED', label: t('reservations.statusLabels.fulfilled', 'Fulfilled') },
                { value: 'CANCELED', label: t('reservations.statusLabels.cancelled', 'Cancelled') },
                { value: 'NO_SHOW', label: t('reservations.statusLabels.noShow', 'No Show') }
            ],
            defaultValue: ''
        },
        {
            key: 'filterBySource',
            label: t('export.reservationSource', 'Reservation Source'),
            input: 'select',
            options: [
                { value: '', label: t('export.all', 'All Sources') },
                { value: 'MARKETPLACE', label: t('overview.charts.reservationsSource.legend.MarketPlace') },
                { value: 'WIDGET', label: t('overview.charts.reservationsSource.legend.Widget') },
                { value: 'WEBSITE', label: t('overview.charts.reservationsSource.legend.ThirdParty') },
                { value: 'WALK_IN', label: t('overview.charts.reservationsSource.legend.WalkIn') },
                { value: 'BACK_OFFICE', label: t('overview.charts.reservationsSource.legend.BackOffice') },
            ],
            defaultValue: ''
        },
        {
            key: 'includeTableUsageStats',
            label: t('export.includeTableUsageStats', 'Include Table Usage Stats'),
            input: 'checkbox',
            defaultValue: false
        },
        {
            key: 'includeReservationStatusStats',
            label: t('export.includeReservationStatusStats', 'Include Reservation Status Stats'),
            input: 'checkbox',
            defaultValue: false
        },
        {
            key: 'includeReservationSourceStats',
            label: t('export.includeReservationSourceStats', 'Include Reservation Source Stats'),
            input: 'checkbox',
            defaultValue: false
        },
        {
            key: 'async',
            label: t('export.asyncGeneration', 'Notify me when the export is ready'),
            input: 'checkbox',
            defaultValue: false,
            children: [
                {
                    key: 'email',
                    label: t('export.notificationEmail', 'Notification Email'),
                    input: 'text',
                    defaultValue: ''
                }
            ],
            showChildrenWhen: { value: true, condition: 'truthy' }
        }
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