import { useState, useRef, useEffect  } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useDarkContext } from "../../context/DarkContext";
import BaseInput from "../common/BaseInput";
import InlineQuillEditor from "../common/InlineQuillEditor";
import { ArrowLeft } from "lucide-react";

const DYNAMIC_VARS = [
  '$$CUSTOMERNAME$$',
  '$$RESERVATIONDATE$$',
  '$$RESERVATIONTIME$$',
  '$$RESTAURANTNAME$$',
  '$$RESERVATIONLINK$$',
  '$$CANCELLATIONLINK$$',
];


interface MessagingTemplatesFormProps {
  templateId?: number | null;
  onCancel?: () => void;
  onSave?: () => void;
}

const MessagingTemplatesForm = ({ templateId, onCancel, onSave }: MessagingTemplatesFormProps) => {
  const { t } = useTranslation();
  const { darkMode } = useDarkContext();
  const isEditMode = templateId != null;

  // In a real app, you would fetch the template data if in edit mode
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  
  const quillRef = useRef<any>(null);

  useEffect(() => {
    if (isEditMode) {
      // Fetch and set data for the given templateId
      console.log("Editing template with ID:", templateId);
      setName(`Sample Template ${templateId}`);
      setContent(`This is the content for template ${templateId}.`);
    } else {
      // Reset form for new template
      setName('');
      setContent('');
    }
  }, [templateId, isEditMode]);

  const handleInsertVariable = (variable: string) => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const range = quill.getSelection(true);
      quill.insertText(range.index, ` ${variable} `, 'user');
      quill.setSelection(range.index + variable.length + 2, 0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to save the template (API call)
    console.log({ id: templateId, name, content });
    if (onSave) onSave(); 
  };

  return (
    <div className={`p-6 rounded-lg w-full ${darkMode ? 'bg-bgdarktheme' : 'bg-white'}`}>
      <div className="flex justify-between items-start mb-6">
        <div>
      <h2 className="text-2xl font-bold mb-4">
        {isEditMode ? t('settingsPage.messagingTemplates.editTemplate') : t('settingsPage.messagingTemplates.newTemplate')}
      </h2>
      </div>
      <button
          onClick={onCancel}
          className="btn-primary flex items-center gap-2 px-4 py-2"
        >
          <ArrowLeft size={20} />
          {t('reservationWidget.common.back')}
        </button>
        </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <BaseInput
          label={t('settingsPage.messagingTemplates.templateName')}
          value={name}
          onChange={setName}
          placeholder="e.g. Reservation Confirmation"
          rules={[(v) => v.length > 0 ? null : 'Name is required']}
        />

        <div className="flex flex-col md:flex-row gap-6">
          {/* Editor Section */}
          <div className="w-full md:w-3/4">
            <label className="block mb-2 font-medium">{t('settingsPage.messagingTemplates.content')}</label>
            <InlineQuillEditor
              ref={quillRef}
              value={content}
              onChange={setContent}
              placeholder="Write your template content here..."
            />
          </div>

          {/* Sticky Dynamic Variables Section */}
          <div className="w-full md:w-1/4">
            <div className="md:sticky md:top-6">
              <h3 className="font-medium mb-2">{t('settingsPage.messagingTemplates.dynamicVariables')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Click to insert a variable into the editor.</p>
              <div className="flex flex-wrap gap-2">
                {DYNAMIC_VARS.map((variable) => (
                  <button
                    type="button"
                    key={variable}
                    onClick={() => handleInsertVariable(variable)}
                    className={`px-3 py-1 text-sm rounded-full cursor-pointer transition ${darkMode ? 'bg-darkthemeitems hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                  >
                    {variable}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-4">
          <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-darkthemeitems hover:bg-gray-300 dark:hover:bg-gray-600">
            {t('common.cancel')}
          </button>
          <button type="submit" className="px-4 py-2 rounded-lg bg-greentheme text-white hover:bg-green-700">
            {t('common.save')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessagingTemplatesForm;