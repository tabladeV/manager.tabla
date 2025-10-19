import { useTranslation } from "react-i18next";
import { Plus, Trash } from "lucide-react";
import { useState, useEffect } from "react";
import { useDarkContext } from "../../context/DarkContext";
import { useNavigate } from "react-router-dom";
import { useList, useDelete, BaseKey } from "@refinedev/core";

interface Template {
  id: BaseKey;
  name: string;
  html_content: string;
}

interface TemplatesApiResponse {
  results: Template[];
  count: number;
}

const MessagingTemplates = () => {
  const { t } = useTranslation();
  const { darkMode } = useDarkContext();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);

  const { data, isLoading, isError } = useList({
    resource: "api/v1/bo/templates/",
    pagination: {
        pageSize: 100,
    }
  });

  useEffect(() => {
    if ((data?.data as any as TemplatesApiResponse)?.results ) {
      setTemplates((data?.data as any as TemplatesApiResponse).results);
    }
  }, [data]);

  const { mutate: deleteTemplate } = useDelete();

  const handleDelete = (id: BaseKey) => {
    deleteTemplate({
      resource: "api/v1/bo/templates/",
      id,
    }, {
      onSuccess: () => {
        setTemplates((prevTemplates) => prevTemplates.filter((template) => template.id !== id));
      }
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error fetching templates.</div>;
  }

  return (
    <div className={`w-full rounded-[10px] p-4 ${darkMode ? 'bg-bgdarktheme' : 'bg-white'}`}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('settingsPage.menuItems.messagingTemplates')}</h1>
          <p className="text-sm text-subblack dark:text-softwhitetheme">{t('settingsPage.messagingTemplates.description')}</p>
        </div>
        <button
          onClick={() => navigate('/settings/messaging-templates/new')}
          className="btn-primary flex items-center gap-2 px-4 py-2"
        >
          <Plus size={20} />
          {t('settingsPage.messagingTemplates.newTemplate')}
        </button>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full border-collapse text-left text-sm text-gray-500">
          <thead className={`text-gray-900 dark:text-gray-100 ${darkMode ? 'bg-bgdarktheme' : 'bg-white'}`}>
            <tr>
              <th scope="col" className="px-6 py-4 font-medium">
                {t('settingsPage.messagingTemplates.templateName')}
              </th>
              <th scope="col" className="px-6 py-4 font-medium text-right">
                {t('settingsPage.messagingTemplates.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y border-t dark:border-darkthemeitems border-gray-200">
            {templates.map((template) => (
              <tr
                key={template.id}
                className="dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-bgdarktheme2"
              >
                <td
                  className="px-6 py-4 cursor-pointer"
                  onClick={() => navigate(`/settings/messaging-templates/edit/${template.id}`)}
                >
                  {template.name}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end">
                    <button
                      className="btn-secondary bg-softredtheme text-redtheme hover:bg-redtheme hover:text-white p-2 rounded-md"
                      onClick={() => handleDelete(template.id)}
                    >
                      <Trash size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MessagingTemplates;