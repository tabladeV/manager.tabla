import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Column, CustomField } from './config/exportConfig';
import BaseBtn from './BaseBtn';


interface ExportModalProps {
  title?: string;
  customOptionsTitle?: string;
  columns: Column[];
  customFields?: CustomField[];
  onExport: (format: 'sheet' | 'pdf', selectedColumns: string[], customValues: Record<string, any>, pdfEngine?: 'xhtml2pdf' | 'reportlab') => void;
  onClose: () => void;
  loading?: boolean;
}

const ExportModal = ({ columns, customFields = [], title, customOptionsTitle, onExport, onClose, loading }: ExportModalProps) => {
  const { t } = useTranslation();
  const [exportFormat, setExportFormat] = useState<'sheet' | 'pdf'>('sheet');
  const [pdfEngine, setPdfEngine] = useState<'xhtml2pdf' | 'reportlab'>('xhtml2pdf');
  const [selectedColumns, setSelectedColumns] = useState<string[]>(columns.map(c => c.key));
  const [customValues, setCustomValues] = useState<Record<string, any>>(() => {
    // Initialize custom values with defaults (recursive function to handle nested fields)
    const initializeValues = (fields: CustomField[]): Record<string, any> => {
      const values: Record<string, any> = {};

      fields.forEach(field => {
        if (field.defaultValue !== undefined) {
          values[field.key] = field.defaultValue;
        } else {
          // Set sensible defaults based on input type
          switch (field.input) {
            case 'checkbox':
              values[field.key] = false;
              break;
            case 'checkboxGroup':
              values[field.key] = field.defaultValue || [];
              break;
            case 'radio':
            case 'select':
              values[field.key] = field.options && field.options.length > 0
                ? field.options[0].value
                : '';
              break;
            case 'number':
              values[field.key] = 0;
              break;
            case 'text':
            default:
              values[field.key] = '';
              break;
          }
        }

        // If field has children, initialize their values too
        if (field.children && field.children.length > 0) {
          const childValues = initializeValues(field.children);
          Object.assign(values, childValues);
        }
      });

      return values;
    };

    return initializeValues(customFields);
  });

  const handleColumnChange = (key: string, checked: boolean) => {
    if (checked) {
      setSelectedColumns(prev => [...prev, key]);
    } else {
      setSelectedColumns(prev => prev.filter(k => k !== key));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedColumns(columns.map(c => c.key));
    } else {
      setSelectedColumns([]);
    }
  };

  const handleCustomFieldChange = (key: string, value: any) => {
    setCustomValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Function to determine if children should be shown
  const shouldShowChildren = (field: CustomField): boolean => {
    if (!field.showChildrenWhen || !field.children || field.children.length === 0) {
      return false;
    }

    const { value, condition = 'equals' } = field.showChildrenWhen;
    const fieldValue = customValues[field.key];

    switch (condition) {
      case 'equals':
        return fieldValue === value;
      case 'notEquals':
        return fieldValue !== value;
      case 'includes':
        return Array.isArray(fieldValue) && fieldValue.includes(value);
      case 'truthy':
        return !!fieldValue;
      case 'falsy':
        return !fieldValue;
      default:
        return fieldValue === value;
    }
  };

  // Recursive function to render a field and its children
  const renderFieldWithChildren = (field: CustomField, level = 0): JSX.Element => {
    const showChildren = shouldShowChildren(field);

    return (
      <div key={field.key} className="flex flex-col">
        <div className={`${level > 0 ? 'ml-4' : ''}`}>
          <label className="mb-1 font-medium mr-2">{field.label}</label>
          {renderCustomField(field)}
        </div>

        {showChildren && field.children && (
          <div className="ml-6 mt-2 pl-2 border-l-2 border-gray-300 dark:border-gray-600 space-y-3">
            {field.children.map(childField => renderFieldWithChildren(childField, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderCustomField = (field: CustomField) => {
    switch (field.input) {
      case 'text':
        return (
          <input
            type="text"
            value={customValues[field.key] || ''}
            onChange={(e) => handleCustomFieldChange(field.key, e.target.value)}
            className="inputs w-full p-3 border border-gray-300 dark:border-darkthemeitems rounded-lg bg-white dark:bg-darkthemeitems text-black dark:text-white"
          />
        );
      case 'date':
        return (
          <input
            type="date"
            value={customValues[field.key] || ''}
            onChange={(e) => handleCustomFieldChange(field.key, e.target.value)}
            className="inputs w-full p-3 border border-gray-300 dark:border-darkthemeitems rounded-lg bg-white dark:bg-darkthemeitems text-black dark:text-white"
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={customValues[field.key] || 0}
            onChange={(e) => handleCustomFieldChange(field.key, e.target.value)}
            className="inputs w-full p-3 border border-gray-300 dark:border-darkthemeitems rounded-lg bg-white dark:bg-darkthemeitems text-black dark:text-white"
          />
        );
      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={!!customValues[field.key]}
            onChange={(e) => handleCustomFieldChange(field.key, e.target.checked)}
            className="checkbox w-5 h-5 rounded border-gray-300 text-[#88AB61] focus:ring-[#88AB61]"
          />
        );
      case 'checkboxGroup':
        return (
          <div className="flex flex-col space-y-2">
            {field.options?.map(option => (
              <label key={`${field.key}_${option.value}`} className="flex items-center">
                <input
                  type="checkbox"
                  value={option.value}
                  checked={(customValues[field.key] || []).includes(option.value)}
                  onChange={(e) => {
                    const currentValues = customValues[field.key] || [];
                    const newValues = e.target.checked
                      ? [...currentValues, option.value]
                      : currentValues.filter((v: any) => v !== option.value);
                    handleCustomFieldChange(field.key, newValues);
                  }}
                  className="checkbox w-5 h-5 rounded border-gray-300 text-[#88AB61] focus:ring-[#88AB61] mr-2"
                />
                {option.label}
              </label>
            ))}
          </div>
        );
      case 'radio':
        return (
          <div className="flex flex-col space-y-2">
            {field.options?.map(option => (
              <label key={option.value} className="flex items-center">
                <input
                  type="radio"
                  value={option.value}
                  checked={customValues[field.key] === option.value}
                  onChange={() => handleCustomFieldChange(field.key, option.value)}
                  className="radio mr-2"
                />
                {option.label}
              </label>
            ))}
          </div>
        );
      case 'select':
        return (
          <select
            value={customValues[field.key] || ''}
            onChange={(e) => handleCustomFieldChange(field.key, e.target.value)}
            className='inputs w-full p-3 border border-gray-300 dark:border-darkthemeitems rounded-lg bg-white dark:bg-darkthemeitems text-black dark:text-white'
          >
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Overlay for clicking outside to close */}
      <div className="overlay" onClick={onClose}></div>
      <div className={`sidepopup w-[45%] overflow-y-auto lt-sm:w-full lt-sm:h-[70vh] lt-sm:bottom-0 lt-sm:overflow-y-auto h-full ${localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme text-white' : 'bg-white'} pb-0`}>
        <h2 className="text-2xl font-[600] mb-4">{title || t('export.title', 'Export Data')}</h2>
        <div className="space-y-4">
          {/* Format Selection */}
          <div>
            <h3 className="text-lg font-medium mb-2">{t('export.selectFormat', 'Select Format')}</h3>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="sheet"
                  checked={exportFormat === 'sheet'}
                  onChange={() => setExportFormat('sheet')}
                  className="radio mr-2"
                />
                {t('export.formatSheet', 'Sheet (CSV)')}
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="pdf"
                  checked={exportFormat === 'pdf'}
                  onChange={() => setExportFormat('pdf')}
                  className="radio mr-2"
                />
                {t('export.formatPDF', 'PDF')}
              </label>
            </div>
          </div>

          {/* PDF Engine Selection */}
          {exportFormat === 'pdf' && (
            <div>
              <h3 className="text-lg font-medium mb-2">{t('export.pdfEngineTitle', 'PDF Engine')}</h3>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="xhtml2pdf"
                    checked={pdfEngine === 'xhtml2pdf'}
                    onChange={() => setPdfEngine('xhtml2pdf')}
                    className="radio mr-2"
                  />
                  {t('export.pdfEngineStandard', 'Standard (Web View)')}
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="reportlab"
                    checked={pdfEngine === 'reportlab'}
                    onChange={() => setPdfEngine('reportlab')}
                    className="radio mr-2"
                  />
                  {t('export.pdfEngineAdvanced', 'Advanced (Complex Tables)')}
                </label>
              </div>
            </div>
          )}

          {/* Column Selection */}
          <div>
            <h3 className="text-lg font-medium mb-2">{t('export.selectColumns', 'Select Columns')}</h3>
            <div className="mb-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedColumns.length === columns.length}
                  onChange={e => handleSelectAll(e.target.checked)}
                  className="checkbox w-5 h-5 rounded border-gray-300 text-[#88AB61] focus:ring-[#88AB61] mr-2"
                />
                {t('export.selectAll', 'Select All')}
              </label>
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto bg-[#F6F6F6] dark:bg-bgdarktheme2 p-1 px-2 rounded-lg">
              {columns.map(column => (
                <label key={column.key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(column.key)}
                    onChange={e => handleColumnChange(column.key, e.target.checked)}
                    className="checkbox w-5 h-5 rounded border-gray-300 text-[#88AB61] focus:ring-[#88AB61] mr-2"
                  />
                  {column.label}
                </label>
              ))}
            </div>
          </div>

          {/* Custom Fields Section */}
          {customFields.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">{customOptionsTitle || t('export.customOptions', 'Custom Options')}</h3>
              <div className="space-y-3">
                {customFields.map(field => renderFieldWithChildren(field))}
              </div>
            </div>
          )}

        </div>
        {/* Buttons */}
          <div className="flex justify-center space-x-2 mt-6 bg-white dark:bg-bgdarktheme2 py-5 sticky bottom-0">
            <BaseBtn
              variant="primary"
              loading={loading}
              onClick={onClose}
              className="btn-secondary hover:bg-[#88AB6150] hover:text-greentheme transition-colors"
            >
              {t('export.closeButton', 'Close')}
            </BaseBtn>
            <BaseBtn
              variant="primary"
              loading={loading}
              onClick={() => onExport(exportFormat, selectedColumns, customValues, exportFormat === 'pdf' ? pdfEngine : undefined)}
              className="btn-primary"
              disabled={selectedColumns.length === 0}
            >
              {t('export.exportButton', 'Export')}
            </BaseBtn>
          </div>
      </div>
    </div>
  );
};

export default ExportModal;