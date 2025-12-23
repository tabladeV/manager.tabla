"use client"

import type React from "react"

import { useCallback, useEffect, useRef, useState } from "react"
import AccessToClient from "../../components/clients/AccessToClient"
import SearchBar from "../../components/header/SearchBar"
import { Outlet, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { type BaseKey, type BaseRecord, useCreate, useList, useNotification } from "@refinedev/core"

import image from "../../assets/profile.png"
import ExportModal from "../../components/common/ExportModal"
import useExportConfig from "../../components/common/config/exportConfig"
import { httpClient } from "../../services/httpClient"
import { saveAs } from "file-saver"
import { useAsyncTaskManager } from "../../hooks/useAsyncTaskManager"
import { DevOnly } from "../../components/DevOnly"
import InlineQuillEditor from "../../components/common/InlineQuillEditor"
import BaseBtn from "../../components/common/BaseBtn"
import Portal from "../../components/common/Portal"

interface LoadingRowProps {
  isDarkMode: boolean
}

interface Template {
  id: BaseKey;
  name: string;
  subject: string;
  html_content: string;
}

interface NotificationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  selectedClients: BaseRecord[];
  allClients: boolean;
  onSend: (values: { customers?: BaseKey[], template?: number, subject: string, message: string, all?: boolean }) => void;
  templates: Template[];
  isLoading: boolean;
  isSending: boolean;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({
  isOpen,
  onClose,
  selectedClients,
  allClients,
  onSend,
  templates,
  isLoading,
  isSending,
}) => {
  const { t } = useTranslation();
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templateSearch, setTemplateSearch] = useState("");
  const [showTemplateList, setShowTemplateList] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSubject("");
      setContent("");
      setSelectedTemplate(null);
      setTemplateSearch("");
      setShowTemplateList(false);
    }
  }, [isOpen]);

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setSubject(template.subject);
    setContent(template.html_content);
    setTemplateSearch(template.name);
    setShowTemplateList(false);
  };

  const handleSend = () => {
    const payload: any = {
      subject,
      message: content,
      template: selectedTemplate?.id,
    };
    if (allClients) {
      payload.all = true;
    } else {
      payload.customers = selectedClients.map(c => c.id);
    }
    onSend(payload);
  };

  if (!isOpen) return null;

  const filteredTemplates = templates.filter(t => t.name.toLowerCase().includes(templateSearch.toLowerCase()));

  return (
    <Portal>
      <div>
        <div className="overlay glassmorphism" onClick={onClose}></div>
        <div className={`sidepopup w-[70%] h-full lt-sm:w-full overflow-y-auto lt-sm:h-[70vh] lt-sm:bottom-0 bg-white dark:bg-bgdarktheme`}>
          <h2 className="text-2xl font-bold mb-4">{t("clients.sendNotificationTitle")}</h2>
          <div className="flex flex-col gap-4">
            <div className="p-2 rounded-[10px] cursor-default">
              <p className="text-greentheme font-[600] mb-2">Send to</p>
              <div className="flex gap-2 flex-wrap">
                {allClients && <p className={`text-sm btn dark:text-white`}>{t("clients.allClients")}</p>}
                {selectedClients.slice(0, 4).map((client) => (
                  <div key={client.id} className={`flex items-center gap-2 dark:text-white`}>
                    <p className={`text-sm btn dark:text-white`}>{client.full_name}</p>
                  </div>
                ))}
                {selectedClients.length > 4 && (
                  <p className={`text-sm btn dark:text-white`}>{t("clients.linkers.and")} {selectedClients.length - 4} {t("clients.linkers.more")}</p>
                )}
              </div>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search for a template"
                className={`inputs-unique bg-white dark:bg-bgdarktheme2`}
                onChange={(e) => {
                  setShowTemplateList(true);
                  setTemplateSearch(e.target.value);
                }}
                value={templateSearch}
                onFocus={() => setShowTemplateList(true)}
              />
              {showTemplateList && (
                <div className={`absolute z-10 w-full mt-1 flex max-h-[25vh] overflow-y-auto flex-col gap-2 p-4 rounded-[10px] bg-white dark:bg-bgdarktheme2 shadow-lg`}>
                  {isLoading ? <div>Loading templates...</div> :
                    filteredTemplates.length > 0 ? filteredTemplates.map((template) => (
                      <div
                        key={template.id}
                        className={`flex flex-col btn cursor-pointer bg-white dark:text-white dark:bg-darkthemeitems`}
                        onClick={() => handleSelectTemplate(template)}
                      >
                        <p>{template.name}</p>
                      </div>
                    )) : <div>No templates found.</div>
                  }
                </div>
              )}
            </div>

            <input
              type="text"
              placeholder="Subject"
              className={`inputs-unique bg-white dark:bg-bgdarktheme2`}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />

            <InlineQuillEditor
              value={content}
              onChange={setContent}
              placeholder="Write your template content here..."
            />

            <BaseBtn variant="primary" className="mt-4" onClick={handleSend} loading={isSending}>
              Send
            </BaseBtn>
          </div>
        </div>
      </div>
    </Portal>
  );
};


const LoadingComponent: React.FC<LoadingRowProps> = ({ isDarkMode }) => {
  return (
    <div className="flex flex-col gap-2">
      <div
        className={`w-full text-center py-[1.4em] rounded-lg ${isDarkMode ? "bg-softgreentheme" : "bg-softgreentheme"}`}
        style={{ animationDuration: "0.1s" }}
      >
        <div className="m-2 t"></div>
      </div>
      <div
        className={`w-full text-center py-[2em] rounded-lg ${isDarkMode ? "bg-darkthemeitems" : "bg-gray-100"}`}
        style={{ animationDuration: "0.1s" }}
      ></div>
      <div
        className={`w-full text-center py-[2em] rounded-lg ${isDarkMode ? "bg-darkthemeitems" : "bg-gray-100"}`}
        style={{ animationDuration: "0.1s" }}
      ></div>
      <div
        className={`w-full text-center py-[2em] rounded-lg ${isDarkMode ? "bg-darkthemeitems" : "bg-gray-100"}`}
        style={{ animationDuration: "0.4s" }}
      ></div>
      <div
        className={`w-full text-center py-[2em] rounded-lg ${isDarkMode ? "bg-darkthemeitems" : "bg-gray-100"}`}
        style={{ animationDuration: "0.2s" }}
      ></div>
      <div
        className={`w-full text-center py-[2em] rounded-lg ${isDarkMode ? "bg-darkthemeitems" : "bg-gray-100"}`}
        style={{ animationDuration: "1s" }}
      ></div>
      <div
        className={`w-full text-center py-[2em] rounded-lg ${isDarkMode ? "bg-darkthemeitems" : "bg-gray-100"}`}
        style={{ animationDuration: "2s" }}
      ></div>
    </div>
  )
}
interface ClientData {
  id: string
  name: string
  email: string
  phoneNumber: string
  image: string
  lifetime: {
    upcoming: number
    materialized: number
    denied: number
    cancelled: number
    noShow: number
    spendCover: number
    spendMAD: number
  }
}

const ClientsPage = () => {
  useEffect(() => {
    document.title = "Clients | Tabla"
  }, [])

  const [pageSize, setPageSize] = useState(5)
  const [page, setPage] = useState(1)
  const { open: openNotification } = useNotification();

  interface ClientsType {
    results: BaseRecord[]
    count: number
  }

  const [clientsAPIInfo, setClientsAPIInfo] = useState<ClientsType>()

  const [templates, setTemplates] = useState<Template[]>([])

  const {
    data: templateData,
    isLoading: templateIsLoading,
  } = useList<Template>({
    resource: "api/v1/bo/templates/",
    pagination: { pageSize: 100 },
    queryOptions: {
      onSuccess(data) {
        setTemplates((data.data as any).results as Template[])
      },
    },
  })

  const [searchKeyword, setSearchKeyword] = useState("")

  const { data, isLoading, error } = useList({
    resource: "api/v1/bo/customers/",
    filters: [
      {
        field: "page",
        operator: "eq",
        value: page,
      },
      {
        field: "page_size",
        operator: "eq",
        value: pageSize,
      },
      {
        field: "search",
        operator: "eq",
        value: searchKeyword,
      },
    ],
    queryOptions: {
      onSuccess(data) {
        setClientsAPIInfo(data.data as unknown as ClientsType)
      },
    },
    errorNotification(error, values, resource) {
      return {
        type: "error",
        message: error?.formattedMessage,
      }
    },
  })

  const { mutate: sendToAll, isLoading: isSendingToAll } = useCreate({
    resource: "api/v1/bo/notifications/send_all/",
    mutationOptions: {
      onSuccess: (data) => {
        openNotification?.({ type: 'success', message: 'Notification sent to all clients successfully!' });
        setShowNotificationModal(false);
      },
      onError: (error) => {
        openNotification?.({ type: 'error', message: `Failed to send notification: ${error.message}` });
      },
    },
  })

  const { mutate: sendNotification, isLoading: isSendingNotification } = useCreate({
    resource: "api/v1/bo/notifications/",
    mutationOptions: {
      onSuccess: (data) => {
        openNotification?.({ type: 'success', message: 'Notification sent successfully!' });
        setShowNotificationModal(false);
      },
      onError: (error) => {
        openNotification?.({ type: 'error', message: `Failed to send notification: ${error.message}` });
      },
    },
  })

  const [clients, setClients] = useState<BaseRecord[]>([])

  const observerRef = useRef(null)

  useEffect(() => {
    if (clientsAPIInfo) {
      setClients(clientsAPIInfo.results as BaseRecord[])
    }
  }, [clientsAPIInfo])

  const { t } = useTranslation()

  const [selectedClient, setSelectedClient] = useState<BaseRecord[]>([])
  const [searchResults, setSearchResults] = useState(clients)

  const [showExportModal, setShowExportModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const { customers } = useExportConfig()
  const { startTask, AsyncTaskManager } = useAsyncTaskManager()

  useEffect(() => {
    setSearchResults(clients)
  }, [clients])

  const searchFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keyword = e.target.value
    setSearchKeyword(keyword)
  }

  const { pathname } = useLocation()

  const selectClient = (id: BaseKey | undefined) => {
    setSelectedClient((prevSelectedClients) => {
      const isAlreadySelected = prevSelectedClients.some((client) => client.id === id)

      if (isAlreadySelected) {
        return prevSelectedClients.filter((client) => client.id !== id)
      } else {
        const client = clients.find((client) => client.id === id)
        return client ? [...prevSelectedClients, client] : prevSelectedClients
      }
    })
  }

  const selectAll = () => {
    setSelectedClient(searchResults)
  }

  const [showNotificationModal, setShowNotificationModal] = useState(false)

  const loadMore = useCallback(() => {
    setPageSize((prevPageSize) => prevPageSize + 4)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 1 },
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [loadMore])

  const [allClients, setAllClients] = useState(false)

  const sendNotificationHandler = (values: { customers?: BaseKey[], template?: number, subject: string, message: string, all?: boolean }) => {
    const payload = {
      subject: values.subject,
      message: values.message,
      template: values.template,
    };

    if (values.all) {
      sendToAll({ values: payload });
    } else if (values.customers) {
      sendNotification({ values: { ...payload, customers: values.customers } });
    }
  };

  const handleExport = async (format: 'sheet' | 'pdf', selectedColumns: string[], customValues: Record<string, any>, pdfEngine?: 'xhtml2pdf' | 'reportlab') => {
    const {
      created_at__gte,
      created_at__lte,
      title,
      is_active,
      includeTitleStats,
      async: asyncGeneration,
      email
    } = customValues;

    const requestBody: any = {
      format,
      selected_columns: selectedColumns,
      async: asyncGeneration,
      customOptions: {
        includeTitleStats: !!includeTitleStats,
      },
      pdf_engine: pdfEngine,
      customers: []
    };

    if (selectedClient.length > 0) {
      requestBody.customers = selectedClient.map(c => c.id);
    }

    if (created_at__gte) requestBody.created_at__gte = created_at__gte;
    if (created_at__lte) requestBody.created_at__lte = created_at__lte;
    if (title) requestBody.title = title;
    if (is_active !== 'all') requestBody.customOptions.is_active = is_active === 'true';
    if (searchKeyword) requestBody.search = searchKeyword;
    if (asyncGeneration && email) requestBody.email = email;

    try {
      setLoading(true);
      const response = await httpClient.post('/api/v1/bo/reports/customers/', requestBody, {
        responseType: asyncGeneration ? 'json' : 'blob',
      });

      if (asyncGeneration) {
        const { task_id } = response.data;
        if (email) {
          alert(`Report generation started. You will be notified by email at ${email}. Task ID: ${task_id}`);
        } else {
          startTask(task_id);
        }
      } else {
        const blob = new Blob([response.data], { type: response.headers['content-type'] });
        const filename = `customers_export.${format === 'sheet' ? 'xlsx' : 'pdf'}`;
        saveAs(blob, filename);
      }
      setShowExportModal(false);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export data. Please check the console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full">
      <AsyncTaskManager />
      {showExportModal && (
        <ExportModal
          title="Export Clients"
          columns={customers.columns}
          customFields={customers.customFields}
          onExport={handleExport}
          onClose={() => setShowExportModal(false)}
          loading={loading}
        />
      )}
      <NotificationPopup
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        selectedClients={selectedClient}
        allClients={allClients}
        onSend={sendNotificationHandler}
        templates={templates}
        isLoading={templateIsLoading}
        isSending={isSendingToAll || isSendingNotification}
      />
      <div className="flex justify-between items-center">
        <h1>{t("clients.title")}</h1>
        <DevOnly>
          <button onClick={() => setShowExportModal(true)} className={`dark:text-whitetheme btn-primary`}>
            {selectedClient?.length ? t('clients.buttons.exportSelected') : t('clients.buttons.exportAll')}
          </button>
        </DevOnly>
      </div>
      <div className="flex gap-2">
        <div
          className={`bg-white dark:bg-bgdarktheme ${pathname === "/clients" || pathname === "/clients/" ? "" : "lt-sm:hidden"
            } sm:w-1/4 w-full h-[calc(100vh-160px)] flex flex-col gap-2 p-2 rounded-[10px]`}
        >
          <SearchBar SearchHandler={searchFilter} />
          {!(selectedClient.length === clients.length) ? (
            <button
              className={`btn-secondary hover:bg-softgreentheme hover:text-greentheme ${selectedClient === clients ? "hidden" : ""}`}
              onClick={selectAll}
            >
              {t("clients.buttons.selectAll")}
            </button>
          ) : (
            <button
              className={`btn dark:text-white ${selectedClient !== clients ? "hidden" : ""}`}
              onClick={() => setSelectedClient([])}
            >
              {t("clients.buttons.deselectAll")}
            </button>
          )}

          <div className="flex flex-col gap-2 overflow-y-scroll overflow-x-auto h-full lt-sm:h-[26em]">
            {isLoading &&
              [...Array(1)].map((_, index) => (
                <LoadingComponent isDarkMode={localStorage.getItem("darkMode") === "true"} />
              ))}
            {searchResults.map((client) => (
              <AccessToClient
                key={client.id}
                onClick={() => selectClient(client.id)}
                image={image}
                checked={selectedClient.some((selected) => selected.id === client.id)}
                name={client.full_name}
                title={client.title}
                id={client.id}
              />
            ))}
            <div ref={observerRef} className="h-10 bg-transparent" />
          </div>

          <button
            className={` btn-secondary`}
            onClick={() => {
              setShowNotificationModal(true)
              setAllClients(true)
              setSelectedClient([])
            }}
          >
            {t("clients.buttons.sendToAll")}
          </button>
          <button
            className={` ${selectedClient.length === 0 ? "btn hover:border-[0px] border-[0px] cursor-not-allowed bg-softgreytheme dark:bg-subblack dark:text-softwhitetheme" : "btn-primary"}`}
            disabled={selectedClient.length === 0}
            onClick={() => {
              setShowNotificationModal(true)
              setAllClients(false)
            }}
          >
            {t("clients.sendNotificationButton")}
          </button>
        </div>
        {pathname === "/clients" || pathname === "/clients/" ? (
          <div className={`lt-sm:hidden flex flex-col items-center w-3/4 text-center p-2 rounded-[10px]`}>
            <h2>{t("clients.selectClient")}</h2>
          </div>
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  )
}

export default ClientsPage