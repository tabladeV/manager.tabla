import { useState, useRef, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useDarkContext } from "../../context/DarkContext";
import BaseInput from "../common/BaseInput";
import InlineQuillEditor from "../common/InlineQuillEditor";
import { ArrowLeft } from "lucide-react";
import { useOne, useCreate, useUpdate, useList } from "@refinedev/core";
import BaseBtn from "../common/BaseBtn";
import EmailAssetsManager from "./EmailAssetsManager";

interface EmailVariable {
  variable: string;
  display_name: string;
  example: string;
  description: string;
}

const MessagingTemplatesForm = () => {
  const { t } = useTranslation();
  const { darkMode } = useDarkContext();
  const navigate = useNavigate();
  const { id: templateId } = useParams<{ id: string }>();
  const isEditMode = templateId != null;

  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [dynamicVars, setDynamicVars] = useState<EmailVariable[]>([]);
  const [isAssetManagerOpen, setIsAssetManagerOpen] = useState(false);

  const quillRef = useRef<any>(null);

  const { data: templateData, isLoading: isLoadingTemplate } = useOne({
    resource: "api/v1/bo/templates",
    id: templateId+'/',
    queryOptions: {
      enabled: isEditMode,
    },
  });

  const { data: variablesData } = useList<EmailVariable>({
    resource: "api/v1/bo/email-variables/",
    pagination: {
        pageSize: 100,
    }
  });

  const { mutate: createTemplate, isLoading: isCreating } = useCreate();
  const { mutate: updateTemplate, isLoading: isUpdating } = useUpdate();

  useEffect(() => {
    if (variablesData?.data) {
      setDynamicVars(variablesData.data);
    }
  }, [variablesData]);

  useEffect(() => {
    if (isEditMode && templateData?.data) {
      setName(templateData.data.name);
      setSubject(templateData.data.subject);
      setContent(templateData.data.html_content);
    }
  }, [templateId, isEditMode, templateData]);

  const handleInsertVariable = (variable: string) => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const range = quill.getSelection(true);
      quill.insertText(range.index, ` ${variable} `, 'user');
      quill.setSelection(range.index + variable.length + 2, 0);
    }
  };

  const handleSelectAsset = (url: string) => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const range = quill.getSelection(true);
      quill.insertEmbed(range.index, 'image', url, 'user');
    }
    setIsAssetManagerOpen(false);
  };

  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
        [{size: []}],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{'list': 'ordered'}, {'list': 'bullet'}, 
         {'indent': '-1'}, {'indent': '+1'}],
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        [{ 'color': [] }, { 'background': [] }],
        ['clean']
      ],
      handlers: {
        image: () => setIsAssetManagerOpen(true),
      },
    },
  }), []);

  const handleCancel = () => {
    navigate('/settings/messaging-templates');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      subject,
      html_content: content,
    };

    const options = {
      onSuccess: () => {
        navigate('/settings/messaging-templates');
      },
    };

    if (isEditMode) {
      updateTemplate({ resource: "api/v1/bo/templates", id: templateId+'/', values: payload }, options);
    } else {
      createTemplate({ resource: "api/v1/bo/templates/", values: payload }, options);
    }
  };

  if (isEditMode && isLoadingTemplate) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`p-6 rounded-lg w-full ${darkMode ? 'bg-bgdarktheme' : 'bg-white'}`}>
      <EmailAssetsManager
        isOpen={isAssetManagerOpen}
        onClose={() => setIsAssetManagerOpen(false)}
        onSelectAsset={handleSelectAsset}
      />
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">
            {isEditMode ? t('settingsPage.messagingTemplates.editTemplate') : t('settingsPage.messagingTemplates.newTemplate')}
          </h2>
        </div>
        <BaseBtn
          onClick={handleCancel}
          variant="primary"
        >
          <ArrowLeft size={20} />
          {t('reservationWidget.common.back')}
        </BaseBtn>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex gap-4">
            <BaseInput
              label={t('settingsPage.messagingTemplates.templateName')}
              value={name}
              onChange={setName}
              placeholder="e.g. Reservation Confirmation"
              rules={[(v) => v.length > 0 ? null : 'Name is required']}
              className="w-1/2"
            />
            <BaseInput
              label={'Subject'}
              value={subject}
              onChange={setSubject}
              placeholder="e.g. Your reservation is confirmed!"
              rules={[(v) => v.length > 0 ? null : 'Subject is required']}
              className="w-1/2"
            />
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-3/4">
            <label className="block mb-2 font-medium">{t('settingsPage.messagingTemplates.content')}</label>
            <InlineQuillEditor
              ref={quillRef}
              value={content}
              onChange={setContent}
              placeholder="Write your template content here..."
              modules={quillModules}
            />
          </div>

          <div className="w-full md:w-1/4">
            <div className="md:sticky md:top-6">
              <h3 className="font-medium mb-2">{t('settingsPage.messagingTemplates.dynamicVariables')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Click to insert a variable into the editor.</p>
              <div className="flex flex-wrap gap-2">
                {dynamicVars.map((item) => (
                  <button
                    type="button"
                    key={item.variable}
                    onClick={() => handleInsertVariable(item.variable)}
                    className={`px-3 py-1 text-sm rounded-full cursor-pointer transition ${darkMode ? 'bg-darkthemeitems hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                    title={`${item.display_name}: ${item.description} (e.g. ${item.example})`}
                  >
                    {item.display_name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-4">
          <BaseBtn type="button" onClick={handleCancel} variant="secondary">
            {t('common.cancel')}
          </BaseBtn>
          <BaseBtn type="submit" variant="primary" loading={isCreating || isUpdating} disabled={isCreating || isUpdating}>
            {isCreating || isUpdating ? 'Saving...' : t('common.save')}
          </BaseBtn>
        </div>
      </form>
    </div>
  );
};

export default MessagingTemplatesForm;