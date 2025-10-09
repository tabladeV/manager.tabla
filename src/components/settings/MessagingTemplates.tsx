import { useTranslation } from "react-i18next";
import { Plus, Trash } from "lucide-react";
import { useState } from "react";
import { useDarkContext } from "../../context/DarkContext";

interface Template {
  id: number;
  name: string;
  content: string;
}
interface MessagingTemplatesProps {
  onNew?: () => void;
  onEdit?: (id: number) => void;
}

const MessagingTemplates = ({ onNew, onEdit }: MessagingTemplatesProps) => {
  const { t } = useTranslation();
  const { darkMode } = useDarkContext();

  // Dummy data
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: 1,
      name: 'Reservation Confirmation',
      content: 'Hello $$CUSTOMERNAME$$, your reservation for $$RESERVATIONDATE$$ at $$RESERVATIONTIME$$ is confirmed.',
    },
    {
      id: 2,
      name: 'Reservation Reminder',
      content: 'Reminder: You have a reservation at $$RESTAURANTNAME$$ tomorrow.',
    },
  ]);

  const deleteTemplate = (id: number) => {
    // In a real app, a confirmation dialog should be used here.
    setTemplates(templates.filter((template) => template.id !== id));
  };

  return (
    // Main container styled like the Users component
    <div className={`w-full rounded-[10px] p-4 ${darkMode ? 'bg-bgdarktheme' : 'bg-white'}`}>
      
      {/* Header Section */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('settingsPage.menuItems.messagingTemplates')}</h1>
          <p className="text-sm text-subblack dark:text-softwhitetheme">{t('settingsPage.messagingTemplates.description')}</p>
        </div>
        {/* Assuming 'btn-primary' is a global style for consistency */}
        <button
          onClick={onNew}
          className="btn-primary flex items-center gap-2 px-4 py-2"
        >
          <Plus size={20} />
          {t('settingsPage.messagingTemplates.newTemplate')}
        </button>
      </div>

      {/* Table Section */}
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
                {/* Clickable cell for editing */}
                <td
                  className="px-6 py-4 cursor-pointer"
                  onClick={() => onEdit && onEdit(template.id)}
                >
                  {template.name}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end">
                    {/* Styled delete button */}
                    <button
                      className="btn-secondary bg-softredtheme text-redtheme hover:bg-redtheme hover:text-white p-2 rounded-md"
                      onClick={() => deleteTemplate(template.id)}
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