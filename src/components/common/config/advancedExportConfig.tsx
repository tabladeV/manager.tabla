import { useTranslation } from 'react-i18next';

export const useAdvancedExportConfig = () => {
  const { t } = useTranslation();
  
  // Column definitions matching the review data table
  const reviewColumns = [
    { key: 'id', label: t('reviews.tableHeaders.id', 'ID') },
    { key: 'name', label: t('reviews.tableHeaders.name', 'Name') },
    { key: 'comment', label: t('reviews.tableHeaders.comment', 'Comment') },
    { key: 'food', label: t('reviews.tableHeaders.food', 'Food') },
    { key: 'service', label: t('reviews.tableHeaders.service', 'Service') },
    { key: 'environment', label: t('reviews.tableHeaders.environment', 'Environment') },
    { key: 'valueForMoney', label: t('reviews.tableHeaders.valueForMoney', 'Value for Money') },
    { key: 'total', label: t('reviews.tableHeaders.total', 'Total') },
    { key: 'date', label: t('reviews.tableHeaders.date', 'Date') }
  ];
  
  // Custom export fields for guest feedback data
  const reviewExportCustomFields = [
    // Basic export options
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
    
    // Include analytics options
    {
      key: 'includeAnalytics',
      label: t('export.includeAnalytics', 'Include Analytics'),
      input: 'checkbox',
      defaultValue: true,
      children: [
        {
          key: 'analyticsType',
          label: t('export.analyticsType', 'Analytics Type'),
          input: 'select',
          options: [
            { value: 'summary', label: t('export.summary', 'Summary Only') },
            { value: 'detailed', label: t('export.detailed', 'Detailed Analysis') },
            { value: 'both', label: t('export.both', 'Both') }
          ],
          defaultValue: 'summary'
        },
        {
          key: 'includeCharts',
          label: t('export.includeCharts', 'Include Charts'),
          input: 'checkbox',
          defaultValue: true,
          children: [
            {
              key: 'chartTypes',
              label: t('export.chartTypes', 'Chart Types'),
              input: 'select',
              options: [
                { value: 'bar', label: t('export.bar', 'Bar Charts') },
                { value: 'line', label: t('export.line', 'Line Charts') },
                { value: 'pie', label: t('export.pie', 'Pie Charts') },
                { value: 'all', label: t('export.all', 'All Chart Types') }
              ],
              defaultValue: 'all'
            }
          ],
          showChildrenWhen: { value: true, condition: 'truthy' }
        },
        {
          key: 'includeTrends',
          label: t('export.includeTrends', 'Include Trends'),
          input: 'checkbox',
          defaultValue: true
        }
      ],
      showChildrenWhen: { value: true, condition: 'truthy' }
    },
    
    // Grouping and filtering options
    {
      key: 'groupBy',
      label: t('export.groupBy', 'Group Data By'),
      input: 'select',
      options: [
        { value: 'none', label: t('export.none', 'No Grouping') },
        { value: 'day', label: t('export.day', 'Day') },
        { value: 'week', label: t('export.week', 'Week') },
        { value: 'month', label: t('export.month', 'Month') }
      ],
      defaultValue: 'none'
    },
    
    // Rating filter
    {
      key: 'ratingFilter',
      label: t('export.ratingFilter', 'Filter by Rating'),
      input: 'select',
      options: [
        { value: 'all', label: t('export.all', 'All Ratings') },
        { value: 'positive', label: t('export.positive', 'Positive (≥ 3.5)') },
        { value: 'neutral', label: t('export.neutral', 'Neutral (2.5-3.4)') },
        { value: 'negative', label: t('export.negative', 'Negative (< 2.5)') },
        { value: 'custom', label: t('export.custom', 'Custom Range') }
      ],
      defaultValue: 'all',
      children: [
        {
          key: 'minRating',
          label: t('export.minRating', 'Minimum Rating'),
          input: 'number',
          defaultValue: 1.0
        },
        {
          key: 'maxRating',
          label: t('export.maxRating', 'Maximum Rating'),
          input: 'number',
          defaultValue: 5.0
        }
      ],
      showChildrenWhen: { value: 'custom', condition: 'equals' }
    },
    
    // Advanced formatting options
    {
      key: 'formatOptions',
      label: t('export.formatOptions', 'Format Options'),
      input: 'checkbox',
      defaultValue: false,
      children: [
        {
          key: 'includeHeaders',
          label: t('export.includeHeaders', 'Include Column Headers'),
          input: 'checkbox',
          defaultValue: true
        },
        {
          key: 'includeStatisticalSummary',
          label: t('export.includeStatisticalSummary', 'Include Statistical Summary'),
          input: 'checkbox',
          defaultValue: true
        },
        {
          key: 'includeSentimentAnalysis',
          label: t('export.includeSentimentAnalysis', 'Include Sentiment Analysis'),
          input: 'checkbox',
          defaultValue: true
        },
        {
          key: 'formatRatings',
          label: t('export.formatRatings', 'Format Ratings As'),
          input: 'select',
          options: [
            { value: 'decimal', label: t('export.decimal', 'Decimal (e.g., 4.5)') },
            { value: 'stars', label: t('export.stars', 'Stars (e.g., ★★★★½)') },
            { value: 'percentage', label: t('export.percentage', 'Percentage (e.g., 90%)') }
          ],
          defaultValue: 'decimal'
        }
      ],
      showChildrenWhen: { value: true, condition: 'truthy' }
    },
    
    // PDF-specific options (shown only when PDF format is selected)
    {
      key: 'pdfOptions',
      label: t('export.pdfOptions', 'PDF Options'),
      input: 'checkbox',
      defaultValue: false,
      children: [
        {
          key: 'paperSize',
          label: t('export.paperSize', 'Paper Size'),
          input: 'select',
          options: [
            { value: 'a4', label: 'A4' },
            { value: 'letter', label: 'Letter' },
            { value: 'legal', label: 'Legal' }
          ],
          defaultValue: 'a4'
        },
        {
          key: 'orientation',
          label: t('export.orientation', 'Orientation'),
          input: 'radio',
          options: [
            { value: 'portrait', label: t('export.portrait', 'Portrait') },
            { value: 'landscape', label: t('export.landscape', 'Landscape') }
          ],
          defaultValue: 'landscape'
        },
        {
          key: 'includeTableOfContents',
          label: t('export.includeTableOfContents', 'Include Table of Contents'),
          input: 'checkbox',
          defaultValue: true
        },
        {
          key: 'includeCoverPage',
          label: t('export.includeCoverPage', 'Include Cover Page'),
          input: 'checkbox',
          defaultValue: true
        }
      ],
      showChildrenWhen: { value: true, condition: 'truthy' }
    }
  ];

  const customerColumns = [
    { key: 'id', label: t('customers.tableHeaders.id', 'ID') },
    { key: 'firstName', label: t('customers.tableHeaders.firstName', 'First Name') },
    { key: 'lastName', label: t('customers.tableHeaders.lastName', 'Last Name') },
    { key: 'fullName', label: t('customers.tableHeaders.fullName', 'Full Name') },
    { key: 'email', label: t('customers.tableHeaders.email', 'Email') },
    { key: 'phoneNumber', label: t('customers.tableHeaders.phoneNumber', 'Phone Number') },
    { key: 'notes', label: t('customers.tableHeaders.notes', 'Notes') },
    { key: 'reservationCount', label: t('customers.tableHeaders.reservationCount', 'Reservation Count') },
    { key: 'lastVisit', label: t('customers.tableHeaders.lastVisit', 'Last Visit') }
  ];
  
  // Custom export fields for customer data
  const customerExportCustomFields = [
    // Include reservation data
    {
      key: 'includeReservations',
      label: t('export.includeReservations', 'Include Reservation History'),
      input: 'checkbox',
      defaultValue: true,
      children: [
        {
          key: 'reservationDateRange',
          label: t('export.reservationDateRange', 'Reservation Date Range'),
          input: 'radio',
          options: [
            { value: 'all', label: t('export.all', 'All Time') },
            { value: 'last30', label: t('export.last30', 'Last 30 Days') },
            { value: 'last90', label: t('export.last90', 'Last 90 Days') },
            { value: 'custom', label: t('export.custom', 'Custom Range') }
          ],
          defaultValue: 'all',
          children: [
            {
              key: 'customStartDate',
              label: t('export.startDate', 'Start Date'),
              input: 'text',
              defaultValue: ''
            },
            {
              key: 'customEndDate',
              label: t('export.endDate', 'End Date'),
              input: 'text',
              defaultValue: ''
            }
          ],
          showChildrenWhen: { value: 'custom', condition: 'equals' }
        },
        {
          key: 'reservationStatus',
          label: t('export.reservationStatus', 'Reservation Status'),
          input: 'select',
          options: [
            { value: 'all', label: t('export.all', 'All Statuses') },
            { value: 'pending', label: t('export.pending', 'Pending') },
            { value: 'confirmed', label: t('export.confirmed', 'Confirmed') },
            { value: 'completed', label: t('export.completed', 'Completed') },
            { value: 'cancelled', label: t('export.cancelled', 'Cancelled') }
          ],
          defaultValue: 'all'
        },
        {
          key: 'includeReservationDetails',
          label: t('export.includeReservationDetails', 'Include Detailed Reservation Info'),
          input: 'checkbox',
          defaultValue: true,
          children: [
            {
              key: 'reservationFields',
              label: t('export.reservationFields', 'Reservation Fields to Include'),
              input: 'select',
              options: [
                { value: 'basic', label: t('export.basic', 'Basic (Date, Time, Guests)') },
                { value: 'detailed', label: t('export.detailed', 'Detailed (All Fields)') }
              ],
              defaultValue: 'basic'
            }
          ],
          showChildrenWhen: { value: true, condition: 'truthy' }
        }
      ],
      showChildrenWhen: { value: true, condition: 'truthy' }
    },
    
    // Customer filtering options
    {
      key: 'customerFilters',
      label: t('export.customerFilters', 'Customer Filters'),
      input: 'checkbox',
      defaultValue: false,
      children: [
        {
          key: 'visitFrequency',
          label: t('export.visitFrequency', 'Visit Frequency'),
          input: 'select',
          options: [
            { value: 'all', label: t('export.all', 'All Customers') },
            { value: 'regular', label: t('export.regular', 'Regular (3+ visits)') },
            { value: 'occasional', label: t('export.occasional', '1-2 visits') },
            { value: 'new', label: t('export.new', 'New customers') }
          ],
          defaultValue: 'all'
        },
        {
          key: 'lastVisitFilter',
          label: t('export.lastVisitFilter', 'Last Visit'),
          input: 'select',
          options: [
            { value: 'all', label: t('export.all', 'Any Time') },
            { value: 'last30', label: t('export.last30', 'Last 30 Days') },
            { value: 'last90', label: t('export.last90', 'Last 90 Days') },
            { value: 'last365', label: t('export.last365', 'Last Year') },
            { value: 'before365', label: t('export.before365', 'More than a Year Ago') }
          ],
          defaultValue: 'all'
        }
      ],
      showChildrenWhen: { value: true, condition: 'truthy' }
    },
    
    // Customer grouping options
    {
      key: 'groupByOption',
      label: t('export.groupByOption', 'Group Customers By'),
      input: 'select',
      options: [
        { value: 'none', label: t('export.none', 'No Grouping') },
        { value: 'visitFrequency', label: t('export.visitFrequency', 'Visit Frequency') },
        { value: 'lastVisit', label: t('export.lastVisit', 'Last Visit Period') }
      ],
      defaultValue: 'none'
    },
    
    // Analytics and statistics
    {
      key: 'includeAnalytics',
      label: t('export.includeAnalytics', 'Include Customer Analytics'),
      input: 'checkbox',
      defaultValue: true,
      children: [
        {
          key: 'analyticsType',
          label: t('export.analyticsType', 'Analytics Type'),
          input: 'select',
          options: [
            { value: 'basic', label: t('export.basic', 'Basic Statistics') },
            { value: 'detailed', label: t('export.detailed', 'Detailed Analysis') }
          ],
          defaultValue: 'basic'
        },
        {
          key: 'includeVisitFrequencyReport',
          label: t('export.includeVisitFrequencyReport', 'Include Visit Frequency Report'),
          input: 'checkbox',
          defaultValue: true
        },
        {
          key: 'includeCustomerRetentionMetrics',
          label: t('export.includeCustomerRetentionMetrics', 'Include Retention Metrics'),
          input: 'checkbox',
          defaultValue: true
        }
      ],
      showChildrenWhen: { value: true, condition: 'truthy' }
    },
    
    // Contact information handling
    {
      key: 'contactInfoOptions',
      label: t('export.contactInfoOptions', 'Contact Information Options'),
      input: 'checkbox',
      defaultValue: true,
      children: [
        {
          key: 'includeEmail',
          label: t('export.includeEmail', 'Include Email Addresses'),
          input: 'checkbox',
          defaultValue: true
        },
        {
          key: 'includePhone',
          label: t('export.includePhone', 'Include Phone Numbers'),
          input: 'checkbox',
          defaultValue: true
        },
        {
          key: 'formatPhoneNumbers',
          label: t('export.formatPhoneNumbers', 'Format Phone Numbers'),
          input: 'select',
          options: [
            { value: 'asStored', label: t('export.asStored', 'As Stored in System') },
            { value: 'international', label: t('export.international', 'International Format (+XX)') },
            { value: 'local', label: t('export.local', 'Local Format') }
          ],
          defaultValue: 'asStored'
        }
      ],
      showChildrenWhen: { value: true, condition: 'truthy' }
    },
    
    // Format specific options (for both CSV and PDF)
    {
      key: 'formatOptions',
      label: t('export.formatOptions', 'Format Options'),
      input: 'checkbox',
      defaultValue: false,
      children: [
        {
          key: 'includeHeaders',
          label: t('export.includeHeaders', 'Include Column Headers'),
          input: 'checkbox',
          defaultValue: true
        },
        {
          key: 'markdownNotes',
          label: t('export.markdownNotes', 'Format Notes as Markdown'),
          input: 'checkbox',
          defaultValue: false
        }
      ],
      showChildrenWhen: { value: true, condition: 'truthy' }
    },
    
    // PDF-specific options
    {
      key: 'pdfOptions',
      label: t('export.pdfOptions', 'PDF Options'),
      input: 'checkbox',
      defaultValue: false,
      children: [
        {
          key: 'paperSize',
          label: t('export.paperSize', 'Paper Size'),
          input: 'select',
          options: [
            { value: 'a4', label: 'A4' },
            { value: 'letter', label: 'Letter' },
            { value: 'legal', label: 'Legal' }
          ],
          defaultValue: 'a4'
        },
        {
          key: 'orientation',
          label: t('export.orientation', 'Orientation'),
          input: 'radio',
          options: [
            { value: 'portrait', label: t('export.portrait', 'Portrait') },
            { value: 'landscape', label: t('export.landscape', 'Landscape') }
          ],
          defaultValue: 'portrait'
        },
        {
          key: 'customerDetailsLayout',
          label: t('export.customerDetailsLayout', 'Customer Details Layout'),
          input: 'select',
          options: [
            { value: 'table', label: t('export.table', 'Table View') },
            { value: 'cards', label: t('export.cards', 'Card View') },
            { value: 'detailed', label: t('export.detailed', 'Detailed View') }
          ],
          defaultValue: 'table'
        },
        {
          key: 'includeCoverPage',
          label: t('export.includeCoverPage', 'Include Cover Page'),
          input: 'checkbox',
          defaultValue: true
        }
      ],
      showChildrenWhen: { value: true, condition: 'truthy' }
    },
    
    // Data privacy options
    {
      key: 'privacyOptions',
      label: t('export.privacyOptions', 'Data Privacy Options'),
      input: 'checkbox',
      defaultValue: false,
      children: [
        {
          key: 'anonymizeData',
          label: t('export.anonymizeData', 'Anonymize Personal Data'),
          input: 'checkbox',
          defaultValue: false
        },
        {
          key: 'includePrivacyStatement',
          label: t('export.includePrivacyStatement', 'Include Privacy Statement'),
          input: 'checkbox',
          defaultValue: true
        }
      ],
      showChildrenWhen: { value: true, condition: 'truthy' }
    }
  ];

  // Column definitions matching the reservation data shown in the screenshot
  const reservationColumns = [
    { key: 'id', label: t('reservations.tableHeaders.id', 'ID') },
    { key: 'fullName', label: t('reservations.tableHeaders.fullName', 'Full Name') },
    { key: 'email', label: t('reservations.tableHeaders.email', 'Email') },
    { key: 'phone', label: t('reservations.tableHeaders.phone', 'Phone') },
    { key: 'comment', label: t('reservations.tableHeaders.comment', 'Comment') },
    { key: 'table', label: t('reservations.tableHeaders.table', 'Table') },
    { key: 'date', label: t('reservations.tableHeaders.date', 'Date') },
    { key: 'time', label: t('reservations.tableHeaders.time', 'Time') },
    { key: 'guests', label: t('reservations.tableHeaders.guests', 'Guests') },
    { key: 'status', label: t('reservations.tableHeaders.status', 'Status') },
    { key: 'reviews', label: t('reservations.tableHeaders.reviews', 'Reviews') }
  ];
  
  // Custom export fields for reservation data
  const reservationExportCustomFields = [
    // Reservation Source filtering
    {
        key: 'reservationSource',
        label: t('export.reservationSource', 'Reservation Source'),
        input: 'select',
        options: [
          { value: 'all', label: t('export.all', 'All Sources') },
          { value: 'website', label: t('export.website', 'Website Booking') },
          { value: 'phone', label: t('export.phone', 'Phone Call') },
          { value: 'walkIn', label: t('export.walkIn', 'Walk-In') },
          { value: 'thirdParty', label: t('export.thirdParty', 'Third-Party Platforms') },
          { value: 'custom', label: t('export.custom', 'Select Specific Sources') }
        ],
        defaultValue: 'all',
        children: [
          {
            key: 'specificSources',
            label: t('export.specificSources', 'Select Sources'),
            input: 'select',
            options: [
              { value: 'website', label: t('export.website', 'Website Booking') },
              { value: 'phone', label: t('export.phone', 'Phone Call') },
              { value: 'walkIn', label: t('export.walkIn', 'Walk-In') },
              { value: 'opentable', label: t('export.opentable', 'OpenTable') },
              { value: 'resy', label: t('export.resy', 'Resy') },
              { value: 'yelp', label: t('export.yelp', 'Yelp') },
              { value: 'googleReservations', label: t('export.googleReservations', 'Google Reservations') }
            ],
            defaultValue: 'website'
          }
        ],
        showChildrenWhen: { value: 'custom', condition: 'equals' }
      },
      
      // Enhanced Status filtering with multiple selection
      {
        key: 'enhancedStatusFilter',
        label: t('export.enhancedStatusFilter', 'Reservation Status (Multiple)'),
        input: 'checkbox',
        defaultValue: true,
        children: [
          {
            key: 'includeConfirmed',
            label: t('export.includeConfirmed', 'Confirmed'),
            input: 'checkbox',
            defaultValue: true
          },
          {
            key: 'includePending',
            label: t('export.includePending', 'Pending'),
            input: 'checkbox',
            defaultValue: true
          },
          {
            key: 'includeSeated',
            label: t('export.includeSeated', 'Seated'),
            input: 'checkbox',
            defaultValue: true
          },
          {
            key: 'includeFulfilled',
            label: t('export.includeFulfilled', 'Fulfilled'),
            input: 'checkbox',
            defaultValue: true
          },
          {
            key: 'includeCancelled',
            label: t('export.includeCancelled', 'Cancelled'),
            input: 'checkbox',
            defaultValue: false
          },
          {
            key: 'includeNoShow',
            label: t('export.includeNoShow', 'No Show'),
            input: 'checkbox',
            defaultValue: false
          }
        ],
        showChildrenWhen: { value: true, condition: 'truthy' }
      },
      
      // Enhanced date filtering
      {
        key: 'enhancedDateFilter',
        label: t('export.enhancedDateFilter', 'Advanced Date Filter'),
        input: 'select',
        options: [
          { value: 'predefined', label: t('export.predefined', 'Predefined Periods') },
          { value: 'custom', label: t('export.custom', 'Custom Date Range') },
          { value: 'relative', label: t('export.relative', 'Relative Time Period') }
        ],
        defaultValue: 'predefined',
        children: [
          // For predefined periods
          {
            key: 'predefinedPeriod',
            label: t('export.predefinedPeriod', 'Select Period'),
            input: 'select',
            options: [
              { value: 'today', label: t('export.today', 'Today') },
              { value: 'yesterday', label: t('export.yesterday', 'Yesterday') },
              { value: 'thisWeek', label: t('export.thisWeek', 'This Week') },
              { value: 'lastWeek', label: t('export.lastWeek', 'Last Week') },
              { value: 'thisMonth', label: t('export.thisMonth', 'This Month') },
              { value: 'lastMonth', label: t('export.lastMonth', 'Last Month') },
              { value: 'thisQuarter', label: t('export.thisQuarter', 'This Quarter') },
              { value: 'lastQuarter', label: t('export.lastQuarter', 'Last Quarter') },
              { value: 'thisYear', label: t('export.thisYear', 'This Year') },
              { value: 'lastYear', label: t('export.lastYear', 'Last Year') }
            ],
            defaultValue: 'thisWeek'
          },
          // For custom date range
          {
            key: 'customStartDate',
            label: t('export.startDate', 'Start Date'),
            input: 'text',
            defaultValue: ''
          },
          {
            key: 'customEndDate',
            label: t('export.endDate', 'End Date'),
            input: 'text',
            defaultValue: ''
          },
          // For relative time period
          {
            key: 'relativePeriod',
            label: t('export.relativePeriod', 'Relative Period'),
            input: 'select',
            options: [
              { value: 'last7days', label: t('export.last7days', 'Last 7 Days') },
              { value: 'last14days', label: t('export.last14days', 'Last 14 Days') },
              { value: 'last30days', label: t('export.last30days', 'Last 30 Days') },
              { value: 'last90days', label: t('export.last90days', 'Last 90 Days') },
              { value: 'last180days', label: t('export.last180days', 'Last 180 Days') },
              { value: 'last365days', label: t('export.last365days', 'Last 365 Days') }
            ],
            defaultValue: 'last30days'
          }
        ],
        showChildrenWhen: { value: null, condition: 'truthy' } // Always show children based on selected option
      },
      
      // Chart visualization options
      {
        key: 'includeVisualizations',
        label: t('export.includeVisualizations', 'Include Visualizations'),
        input: 'checkbox',
        defaultValue: true,
        children: [
          {
            key: 'chartTypes',
            label: t('export.chartTypes', 'Chart Types'),
            input: 'select',
            options: [
              { value: 'auto', label: t('export.auto', 'Automatic (Best Fit)') },
              { value: 'bar', label: t('export.bar', 'Bar Chart') },
              { value: 'line', label: t('export.line', 'Line Chart') },
              { value: 'pie', label: t('export.pie', 'Pie Chart') },
              { value: 'heatmap', label: t('export.heatmap', 'Time Heatmap') },
              { value: 'multiple', label: t('export.multiple', 'Multiple Chart Types') }
            ],
            defaultValue: 'auto'
          },
          {
            key: 'visualizationMetrics',
            label: t('export.visualizationMetrics', 'Visualization Metrics'),
            input: 'select',
            options: [
              { value: 'reservationCount', label: t('export.reservationCount', 'Reservation Count') },
              { value: 'guestCount', label: t('export.guestCount', 'Guest Count') },
              { value: 'tableUtilization', label: t('export.tableUtilization', 'Table Utilization') },
              { value: 'statusDistribution', label: t('export.statusDistribution', 'Status Distribution') },
              { value: 'sourceDistribution', label: t('export.sourceDistribution', 'Source Distribution') },
              { value: 'timeDistribution', label: t('export.timeDistribution', 'Time Distribution') }
            ],
            defaultValue: 'reservationCount'
          },
          {
            key: 'includeDataTable',
            label: t('export.includeDataTable', 'Include Data Table with Charts'),
            input: 'checkbox',
            defaultValue: true
          },
          {
            key: 'chartColorScheme',
            label: t('export.chartColorScheme', 'Chart Color Scheme'),
            input: 'select',
            options: [
              { value: 'default', label: t('export.default', 'Default Theme') },
              { value: 'monochrome', label: t('export.monochrome', 'Monochrome') },
              { value: 'colorful', label: t('export.colorful', 'Colorful') },
              { value: 'pastel', label: t('export.pastel', 'Pastel') }
            ],
            defaultValue: 'default'
          }
        ],
        showChildrenWhen: { value: true, condition: 'truthy' }
      },
    // Date range filtering
    {
      key: 'dateRange',
      label: t('export.dateRange', 'Date Range'),
      input: 'radio',
      options: [
        { value: 'all', label: t('export.all', 'All Dates') },
        { value: 'today', label: t('export.today', 'Today') },
        { value: 'tomorrow', label: t('export.tomorrow', 'Tomorrow') },
        { value: 'thisWeek', label: t('export.thisWeek', 'This Week') },
        { value: 'nextWeek', label: t('export.nextWeek', 'Next Week') },
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
    
    // Time slot filtering
    {
      key: 'timeFilter',
      label: t('export.timeFilter', 'Time Filter'),
      input: 'select',
      options: [
        { value: 'all', label: t('export.all', 'All Times') },
        { value: 'lunch', label: t('export.lunch', 'Lunch (11:00-15:00)') },
        { value: 'dinner', label: t('export.dinner', 'Dinner (17:00-23:00)') },
        { value: 'custom', label: t('export.custom', 'Custom Time Range') }
      ],
      defaultValue: 'all',
      children: [
        {
          key: 'startTime',
          label: t('export.startTime', 'Start Time'),
          input: 'text',
          defaultValue: ''
        },
        {
          key: 'endTime',
          label: t('export.endTime', 'End Time'),
          input: 'text',
          defaultValue: ''
        }
      ],
      showChildrenWhen: { value: 'custom', condition: 'equals' }
    },
    
    // Status filtering
    {
      key: 'statusFilter',
      label: t('export.statusFilter', 'Reservation Status'),
      input: 'select',
      options: [
        { value: 'all', label: t('export.all', 'All Statuses') },
        { value: 'pending', label: t('export.pending', 'Pending') },
        { value: 'confirmed', label: t('export.confirmed', 'Confirmed') },
        { value: 'seated', label: t('export.seated', 'Seated') },
        { value: 'fulfilled', label: t('export.fulfilled', 'Fulfilled') },
        { value: 'cancelled', label: t('export.cancelled', 'Cancelled') },
        { value: 'noShow', label: t('export.noShow', 'No Show') }
      ],
      defaultValue: 'all'
    },
    
    // Table utilization options
    {
      key: 'includeTableUtilization',
      label: t('export.includeTableUtilization', 'Include Table Utilization'),
      input: 'checkbox',
      defaultValue: true,
      children: [
        {
          key: 'tableUtilizationFormat',
          label: t('export.tableUtilizationFormat', 'Table Utilization Format'),
          input: 'select',
          options: [
            { value: 'summary', label: t('export.summary', 'Summary Only') },
            { value: 'detailed', label: t('export.detailed', 'Detailed Breakdown') },
            { value: 'hourly', label: t('export.hourly', 'Hourly Breakdown') }
          ],
          defaultValue: 'summary'
        },
        {
          key: 'includeTableTurnover',
          label: t('export.includeTableTurnover', 'Include Table Turnover Metrics'),
          input: 'checkbox',
          defaultValue: true
        },
        {
          key: 'tableFilter',
          label: t('export.tableFilter', 'Filter by Tables'),
          input: 'select',
          options: [
            { value: 'all', label: t('export.all', 'All Tables') },
            { value: 'custom', label: t('export.custom', 'Select Specific Tables') }
          ],
          defaultValue: 'all',
          children: [
            {
              key: 'specificTables',
              label: t('export.specificTables', 'Select Tables'),
              input: 'select',
              options: [
                { value: '1', label: t('export.table', 'Table 1') },
                { value: '2', label: t('export.table', 'Table 2') },
                { value: '3', label: t('export.table', 'Table 3') },
                { value: '4', label: t('export.table', 'Table 4') },
                { value: '5', label: t('export.table', 'Table 5') },
                { value: '6', label: t('export.table', 'Table 6') }
              ],
              defaultValue: '1'
            }
          ],
          showChildrenWhen: { value: 'custom', condition: 'equals' }
        }
      ],
      showChildrenWhen: { value: true, condition: 'truthy' }
    },
    
    // Guest count filtering
    {
      key: 'guestCountFilter',
      label: t('export.guestCountFilter', 'Guest Count Filter'),
      input: 'select',
      options: [
        { value: 'all', label: t('export.all', 'All Party Sizes') },
        { value: 'small', label: t('export.small', 'Small (1-2 guests)') },
        { value: 'medium', label: t('export.medium', 'Medium (3-6 guests)') },
        { value: 'large', label: t('export.large', 'Large (7+ guests)') },
        { value: 'custom', label: t('export.custom', 'Custom Range') }
      ],
      defaultValue: 'all',
      children: [
        {
          key: 'minGuests',
          label: t('export.minGuests', 'Minimum Guests'),
          input: 'number',
          defaultValue: 1
        },
        {
          key: 'maxGuests',
          label: t('export.maxGuests', 'Maximum Guests'),
          input: 'number',
          defaultValue: 10
        }
      ],
      showChildrenWhen: { value: 'custom', condition: 'equals' }
    },
    
    // Group by options
    {
      key: 'groupBy',
      label: t('export.groupBy', 'Group Reservations By'),
      input: 'select',
      options: [
        { value: 'none', label: t('export.none', 'No Grouping') },
        { value: 'date', label: t('export.date', 'Date') },
        { value: 'status', label: t('export.status', 'Status') },
        { value: 'table', label: t('export.table', 'Table') },
        { value: 'timeSlot', label: t('export.timeSlot', 'Time Slot') },
        { value: 'customer', label: t('export.customer', 'Customer') }
      ],
      defaultValue: 'none'
    },
    
    // Include customer details
    {
      key: 'includeCustomerDetails',
      label: t('export.includeCustomerDetails', 'Include Customer Details'),
      input: 'checkbox',
      defaultValue: true,
      children: [
        {
          key: 'customerDetailsLevel',
          label: t('export.customerDetailsLevel', 'Customer Details Level'),
          input: 'select',
          options: [
            { value: 'basic', label: t('export.basic', 'Basic (Name, Contact)') },
            { value: 'full', label: t('export.full', 'Full Profile') }
          ],
          defaultValue: 'basic'
        },
        {
          key: 'includeVisitHistory',
          label: t('export.includeVisitHistory', 'Include Visit History'),
          input: 'checkbox',
          defaultValue: false
        }
      ],
      showChildrenWhen: { value: true, condition: 'truthy' }
    },
    
    // Analytics and statistics
    {
      key: 'includeAnalytics',
      label: t('export.includeAnalytics', 'Include Reservation Analytics'),
      input: 'checkbox',
      defaultValue: true,
      children: [
        {
          key: 'analyticsType',
          label: t('export.analyticsType', 'Analytics Type'),
          input: 'select',
          options: [
            { value: 'summary', label: t('export.summary', 'Summary Statistics') },
            { value: 'detailed', label: t('export.detailed', 'Detailed Analysis') }
          ],
          defaultValue: 'summary'
        },
        {
          key: 'includePeakTimeAnalysis',
          label: t('export.includePeakTimeAnalysis', 'Include Peak Time Analysis'),
          input: 'checkbox',
          defaultValue: true
        },
        {
          key: 'includeNoShowAnalysis',
          label: t('export.includeNoShowAnalysis', 'Include No-Show Analysis'),
          input: 'checkbox',
          defaultValue: true
        },
        {
          key: 'includeCancellationAnalysis',
          label: t('export.includeCancellationAnalysis', 'Include Cancellation Analysis'),
          input: 'checkbox',
          defaultValue: true
        }
      ],
      showChildrenWhen: { value: true, condition: 'truthy' }
    },
    
    // PDF-specific options
    {
      key: 'pdfOptions',
      label: t('export.pdfOptions', 'PDF Options'),
      input: 'checkbox',
      defaultValue: false,
      children: [
        {
          key: 'paperSize',
          label: t('export.paperSize', 'Paper Size'),
          input: 'select',
          options: [
            { value: 'a4', label: 'A4' },
            { value: 'letter', label: 'Letter' },
            { value: 'legal', label: 'Legal' }
          ],
          defaultValue: 'a4'
        },
        {
          key: 'orientation',
          label: t('export.orientation', 'Orientation'),
          input: 'radio',
          options: [
            { value: 'portrait', label: t('export.portrait', 'Portrait') },
            { value: 'landscape', label: t('export.landscape', 'Landscape') }
          ],
          defaultValue: 'landscape'
        },
        {
          key: 'includeTableLayout',
          label: t('export.includeTableLayout', 'Include Table Layout Diagram'),
          input: 'checkbox',
          defaultValue: true
        },
        {
          key: 'includeDailySchedule',
          label: t('export.includeDailySchedule', 'Include Daily Schedule View'),
          input: 'checkbox',
          defaultValue: true
        }
      ],
      showChildrenWhen: { value: true, condition: 'truthy' }
    },
    
    // Format options
    {
      key: 'formatOptions',
      label: t('export.formatOptions', 'Format Options'),
      input: 'checkbox',
      defaultValue: false,
      children: [
        {
          key: 'timeFormat',
          label: t('export.timeFormat', 'Time Format'),
          input: 'select',
          options: [
            { value: '24hour', label: t('export.24hour', '24-hour (e.g., 14:30)') },
            { value: '12hour', label: t('export.12hour', '12-hour (e.g., 2:30 PM)') }
          ],
          defaultValue: '24hour'
        },
        {
          key: 'dateFormat',
          label: t('export.dateFormat', 'Date Format'),
          input: 'select',
          options: [
            { value: 'iso', label: t('export.iso', 'ISO (YYYY-MM-DD)') },
            { value: 'us', label: t('export.us', 'US (MM/DD/YYYY)') },
            { value: 'eu', label: t('export.eu', 'EU (DD/MM/YYYY)') }
          ],
          defaultValue: 'iso'
        },
        {
          key: 'highlightDoubleBookings',
          label: t('export.highlightDoubleBookings', 'Highlight Double Bookings'),
          input: 'checkbox',
          defaultValue: true
        }
      ],
      showChildrenWhen: { value: true, condition: 'truthy' }
    },
    
    // Staff assignment
    {
      key: 'includeStaffAssignment',
      label: t('export.includeStaffAssignment', 'Include Staff Assignment'),
      input: 'checkbox',
      defaultValue: false,
      children: [
        {
          key: 'staffAssignmentDetail',
          label: t('export.staffAssignmentDetail', 'Staff Assignment Detail'),
          input: 'select',
          options: [
            { value: 'servers', label: t('export.servers', 'Servers Only') },
            { value: 'all', label: t('export.all', 'All Staff (Servers, Hosts, etc.)') }
          ],
          defaultValue: 'servers'
        }
      ],
      showChildrenWhen: { value: true, condition: 'truthy' }
    }
  ];
  
  return { 
    reviews: {
        columns: reviewColumns,
        customFields: reviewExportCustomFields
    },
    customers: {
        columns: customerColumns,
        customFields: customerExportCustomFields
    },
    reservations: {
        columns: reservationColumns,
        customFields: reservationExportCustomFields
    }
   };
};

export default useAdvancedExportConfig;