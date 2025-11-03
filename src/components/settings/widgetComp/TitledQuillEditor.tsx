import React from 'react';
import { useTranslation } from 'react-i18next';
import QuillEditor from './QuillEditor';

interface TitledQuillEditorProps {
  title?: string;
  titleKey?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  placeholderKey?: string;
  className?: string;
  titleClassName?: string;
  editorClassName?: string;
  readOnly?: boolean;
  modules?: Record<string, any>;
}

const TitledQuillEditor: React.FC<TitledQuillEditorProps> = ({
  title,
  titleKey = 'settingsPage.widget.description',
  value,
  onChange,
  placeholder,
  placeholderKey = 'settingsPage.widget.addDescriptionPlaceholder',
  className = '',
  titleClassName = '',
  editorClassName = '',
  readOnly = false,
  modules = {},
  ...props
}) => {
  const { t } = useTranslation();

  // Use provided title or translate titleKey
  const displayTitle = title || t(titleKey);
  
  // Use provided placeholder or translate placeholderKey
  const displayPlaceholder = placeholder || t(placeholderKey);

  return (
    <div className={`space-y-2 ${className}`} {...props}>
      <h2 className={`text-lg font-semibold mt-2 ${titleClassName}`}>
        {displayTitle}
      </h2>
      <QuillEditor
        value={value}
        onChange={onChange}
        placeholder={displayPlaceholder}
        className={editorClassName}
        readOnly={readOnly}
        modules={modules}
      />
    </div>
  );
};

export default TitledQuillEditor;