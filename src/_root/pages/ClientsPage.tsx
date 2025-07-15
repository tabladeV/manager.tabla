"use client"

import type React from "react"

import { useCallback, useEffect, useRef, useState } from "react"
import AccessToClient from "../../components/clients/AccessToClient"
import SearchBar from "../../components/header/SearchBar"
import { Outlet, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { type BaseKey, type BaseRecord, useCreate, useList } from "@refinedev/core"

import image from "../../assets/profile.png"
import ExportModal from "../../components/common/ExportModal"
import useExportConfig from "../../components/common/config/exportConfig"
import axiosInstance from "../../providers/axiosInstance"
import { saveAs } from "file-saver"
import { useAsyncTaskManager } from "../../hooks/useAsyncTaskManager"

interface LoadingRowProps {
  isDarkMode: boolean
}

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

  interface ClientsType {
    results: BaseRecord[]
    count: number
  }

  const [clientsAPIInfo, setClientsAPIInfo] = useState<ClientsType>()

  const [templates, setTemplates] = useState<BaseRecord[]>()

  const {
    data: templateData,
    isLoading: templateIsLoading,
    error: templateError,
  } = useList({
    resource: "api/v1/bo/notifications/templates/",
    queryOptions: {
      onSuccess(data) {
        setTemplates(data.data as unknown as BaseRecord[])
      },
    },
    errorNotification(error, values, resource) {
      return {
        type: "error",
        message: error?.formattedMessage,
      }
    },
  })

  const [searchKeyword, setSearchKeyword] = useState("")
  console.log(searchKeyword)

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

  const { mutate: sendToAll } = useCreate({
    resource: "api/v1/bo/notifications/send_all/",
    mutationOptions: {
      onSuccess: (data) => {
        console.log("Notification sent to all:", data)
      },
      onError: (error) => {
        console.log("Error in sending notification to all:", error.message)
      },
    },
    errorNotification(error, values, resource) {
      return {
        type: "error",
        message: error?.formattedMessage,
      }
    },
  })

  const { mutate: sendNotification } = useCreate({
    resource: "api/v1/bo/notifications/",
    mutationOptions: {
      onSuccess: (data) => {
        console.log("Notification sent:", data)
      },
      onError: (error) => {
        console.log("Error in sending notification:", error.message)
      },
    },
    errorNotification(error, values, resource) {
      return {
        type: "error",
        message: error?.formattedMessage,
      }
    },
  })

  const [clients, setClients] = useState<BaseRecord[]>([])

  const [visibleClients, setVisibleClients] = useState(clients)
  const observerRef = useRef(null)

  useEffect(() => {
    if (clientsAPIInfo) {
      setClients(clientsAPIInfo.results as BaseRecord[])
    }
  }, [clientsAPIInfo])

  console.log(data)
  const { t } = useTranslation()

  const [selectedClient, setSelectedClient] = useState<BaseRecord[]>([])
  const [searchResults, setSearchResults] = useState(clients)

  const [showExportModal, setShowExportModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const { customers } = useExportConfig()
  const { startTask, AsyncTaskManager } = useAsyncTaskManager()
  // const {customers} = useAdvancedExportConfig();

  useEffect(() => {
    setSearchResults(clients)
  }, [clients])

  const searchFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keyword = e.target.value
    setSearchKeyword(keyword)

    // if (keyword === '') {
    //   setSearchResults(clients);
    // }
    // else{
    //   const results = clients.filter((client) =>
    //     client.full_name.toLowerCase().includes(keyword.toLowerCase())
    //   );
    //   setSearchResults(results);
    // }
  }

  const { pathname } = useLocation()

  const selectClient = (id: BaseKey | undefined) => {
    setSelectedClient((prevSelectedClients) => {
      // Check if the client is already selected
      const isAlreadySelected = prevSelectedClients.some((client) => client.id === id)

      // If already selected, filter it out; otherwise, add the client to the selection
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

  useEffect(() => {
    console.log(selectedClient)
  }, [selectedClient])

  // Pagination

  // Load More Function
  const loadMore = useCallback(() => {
    setPageSize((prevPageSize) => prevPageSize + 4)
  }, [])

  // Intersection Observer to detect when the trigger is visible
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

  const [searchTemplate, setSearchTemplate] = useState(false)

  const [templateSearch, setTemplateSearch] = useState("")

  interface NotificationType {
    clients: BaseRecord[]
    template: number | undefined
    restaurant: number | null
    subject: string
    message: string
  }

  const [notificationInfo, setNotificationInfo] = useState<NotificationType>({
    clients: [],
    template: undefined,
    restaurant: null,
    subject: "",
    message: "",
  })

  const [allClients, setAllClients] = useState(false)

  const sendNotificationHandler = () => {
    console.log(
      selectedClient.map((client) => client.id),
      "CLIENTS",
    )

    const formData = new FormData()
    // formData.append("customers", selectedClient.map((client) => client.id).join(","))
    // formData.append("template", notificationInfo.template?.toString() || "")
    // formData.append("restaurant", notificationInfo.restaurant?.toString() || "")
    // formData.append("subject", notificationInfo.subject)
    // formData.append("message", notificationInfo.message)

    if (allClients) {
      formData.append("template", notificationInfo.template?.toString() || "")
      formData.append("restaurant", notificationInfo.restaurant?.toString() || "")
      formData.append("subject", notificationInfo.subject)
      formData.append("message", notificationInfo.message)

      sendToAll({
        values: formData,
      })
    } else {
      selectedClient.forEach((id, index) => {
        formData.append(`customers`, id?.id?.toString() ?? "");
      });

      // formData.append("customers", selectedClient.map((client) => client.id).join(","))
      formData.append("template", notificationInfo.template?.toString() || "")
      formData.append("restaurant", notificationInfo.restaurant?.toString() || "")
      formData.append("subject", notificationInfo.subject)
      formData.append("message", notificationInfo.message)

      sendNotification({
        values: formData,
      })
    }
  }
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
      const response = await axiosInstance.post('/api/v1/bo/reports/customers/', requestBody, {
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
        // Handle sync response
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
      {showNotificationModal && (
        <div>
          <div
            className="overlay"
            onClick={() => {
              setShowNotificationModal(false)
            }}
          ></div>
          <div
            className={`sidepopup h-full lt-sm:w-full overflow-y-auto lt-sm:h-[70vh] lt-sm:bottom-0 bg-white dark:bg-bgdarktheme`}
          >
            <h2 className="">{t("clients.sendNotificationTitle")}</h2>
            <div className="flex flex-col  gap-2">
              <div className="p-2 rounded-[10px] cursor-default">
                <p className="text-greentheme font-[600] mb-2">Send to</p>
                <div className="flex gap-2 flex-wrap">
                  {allClients && <p className={`text-sm btn dark:text-white`}>{t("clients.allClients")}</p>}
                  {selectedClient.slice(0, 4).map((client) => (
                    <div key={client.id} className={`flex items-center gap-2 dark:text-white`}>
                      <p className={`text-sm btn dark:text-white`}>{client.full_name}</p>
                    </div>
                  ))}
                  {selectedClient.length > 4 && (
                    <p className={`text-sm btn dark:text-white`}>{t("clients.linkers.and")} {selectedClient.length - 4} {t("clients.linkers.more")}</p>
                  )}
                </div>
              </div>
              <input
                type="text"
                placeholder="Template"
                className={`inputs-unique bg-white dark:bg-bgdarktheme2`}
                onChange={(e) => {
                  setSearchTemplate(true)
                  setTemplateSearch(e.target.value)
                }}
                value={templateSearch}
                onFocus={() => {
                  setSearchTemplate(true)
                }}
              />
              {searchTemplate && (
                <div
                  className={`flex max-h-[25vh] overflow-y-auto  flex-col gap-2 p-4 rounded-[10px] bg-white dark:bg-bgdarktheme2`}
                >
                  {templates
                    ?.filter((template) => template.name.toLowerCase().includes(templateSearch.toLowerCase()))
                    .map((template) => (
                      <div
                        key={template.id}
                        className={`flex flex-col  btn cursor-pointer bg-white dark:text-white dark:bg-darkthemeitems`}
                        onClick={() => {
                          setTemplateSearch(template.name)
                          setSearchTemplate(false)
                          setNotificationInfo((prevNotificationInfo) => {
                            return { ...prevNotificationInfo, template: Number(template.id) }
                          })
                        }}
                      >
                        <p>{template.name}</p>
                      </div>
                    ))}
                </div>
              )}

              <input
                type="text"
                placeholder="Subject"
                className={`inputs-unique bg-white dark:bg-bgdarktheme2`}
                onChange={(e) => {
                  setNotificationInfo((prevNotificationInfo) => {
                    return { ...prevNotificationInfo, subject: e.target.value }
                  })
                }}
              />
              <textarea
                placeholder="Type your message here"
                rows={5}
                onChange={(e) => {
                  setNotificationInfo((prevNotificationInfo) => {
                    return { ...prevNotificationInfo, message: e.target.value }
                  })
                }}
                className={`inputs-unique  bg-white dark:bg-bgdarktheme2 focus:border-none`}
              ></textarea>
              <button className="btn-primary" onClick={sendNotificationHandler}>
                Send
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center">
        <h1>{t("clients.title")}</h1>
        <button onClick={() => setShowExportModal(true)} className={`dark:text-whitetheme btn-primary`}>
          {/* {t('reviews.filters.all')} */}
          {selectedClient?.length ? t('clients.buttons.exportSelected') : t('clients.buttons.exportAll')}
        </button>
      </div>
      <div className="flex gap-2">
        <div
          className={`bg-white dark:bg-bgdarktheme ${
            pathname === "/clients" || pathname === "/clients/" ? "" : "lt-sm:hidden"
          } sm:w-1/4 w-full h-[calc(100vh-160px)] flex flex-col gap-2 p-2 rounded-[10px]`}
        >
          <SearchBar SearchHandler={searchFilter} />
          {/* <select className="btn">
            <option>Filter by</option>
            <option>Pending</option>
            <option>Canceled</option>
          </select> */}
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
