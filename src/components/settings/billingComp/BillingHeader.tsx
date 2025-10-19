import { useTranslation } from "react-i18next";

export function BillingHeader() {
  const { t } = useTranslation();
  return <h1 className="text-3xl font-bold mb-8 text-blacktheme dark:text-textdarktheme">{t('settingsPage.billing.title')}</h1>;
  }
  