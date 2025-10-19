"use client"
import type React from "react"
import { type BaseKey, useCreate, useDelete, useList, useUpdate, useCan, CanAccess } from "@refinedev/core"
import { Trash } from "lucide-react"
import { useState, useCallback, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useDarkContext } from "../../context/DarkContext"
import ActionPopup from "../popup/ActionPopup"
import Portal from "../common/Portal"

// Interfaces
export interface Area {
  id: number
  name: string
}

export interface AreasType {
  results: Area[]
  count: number
}

const initialAreas: Area[] = []

// AreaModal Component
interface AreaModalProps {
  isOpen: boolean
  isUpdating: boolean
  area: Area | null
  newArea: Area
  onClose: () => void
  onAddArea: () => void
  onUpdateArea: () => void
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onInputAddChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}

function AreaModal({
  isOpen,
  isUpdating,
  area,
  newArea,
  onClose,
  onAddArea,
  onUpdateArea,
  onInputChange,
  onInputAddChange,
}: AreaModalProps) {
  const { darkMode: isDarkMode } = useDarkContext()
  const { t } = useTranslation()

  if (!isOpen) return null

  return (
    <Portal>
    <div>
      <div className="overlay" onClick={onClose}></div>
      <div
        className={`sidepopup lt-sm:popup lt-sm:h-[70vh] lt-sm:bottom-0 lt-sm:rounded-b-none lt-sm:w-full h-full ${isDarkMode ? "bg-bgdarktheme" : "bg-white"}`}
      >
        <h1 className="text-2xl font-bold mb-3">
          {isUpdating ? t("settingsPage.areas.modals.modifyArea") : t("settingsPage.areas.modals.addArea")}
        </h1>
        {isUpdating ? (
          <div className="flex flex-col gap-3">
            <input
              type="text"
              id="name"
              placeholder={t("settingsPage.areas.form.placeholders.areaName")}
              className={`inputs ${isDarkMode ? "bg-darkthemeitems" : "bg-white"}`}
              value={area?.name || ""}
              onChange={onInputChange}
              required
            />
            <div className="flex justify-center gap-4">
              <button
                type="button"
                className={isDarkMode ? "btn text-white hover:text-redtheme border-white hover:border-redtheme" : "btn"}
                onClick={onClose}
              >
                {t("settingsPage.areas.buttons.cancel")}
              </button>
              <button onClick={onUpdateArea} className="btn-primary">
                {t("settingsPage.areas.buttons.save")}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <input
              type="text"
              id="name"
              placeholder={t("settingsPage.areas.form.placeholders.areaName")}
              className={`inputs ${isDarkMode ? "bg-darkthemeitems" : "bg-white"}`}
              onChange={onInputAddChange}
              required
            />
            <div className="flex justify-center gap-4">
              <button
                type="button"
                className={isDarkMode ? "btn text-white hover:text-redtheme border-white hover:border-redtheme" : "btn"}
                onClick={onClose}
              >
                {t("settingsPage.areas.buttons.cancel")}
              </button>
              <button onClick={onAddArea} className="btn-primary">
                {t("settingsPage.areas.buttons.save")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </Portal>
  )
}

// AreaTable Component
interface AreaTableProps {
  areas: Area[]
  onEdit: (area: Area) => void
  onDelete: (id: BaseKey) => void
}

function AreaTable({ areas, onEdit, onDelete }: AreaTableProps) {
  const { darkMode: isDarkMode } = useDarkContext()
  const { t } = useTranslation()
  const { data: canDelete } = useCan({
    resource: "area",
    action: "delete",
  })

  return (
    <div className="overflow-x-auto w-full">
      <table
        className={`w-full border-collapse text-left text-sm ${isDarkMode ? "bg-bgdarktheme2" : "bg-white text-gray-500"}`}
      >
        <thead className={`${isDarkMode ? "bg-bgdarktheme text-white" : "bg-white text-gray-900"}`}>
          <tr>
            <th scope="col" className="px-6 py-4 font-medium">
              {t("settingsPage.areas.tableHeaders.id")}
            </th>
            <th scope="col" className="px-6 py-4 font-medium">
              {t("settingsPage.areas.tableHeaders.name")}
            </th>
            <th scope="col" className="px-6 py-4 font-medium flex justify-end">
              {t("settingsPage.areas.tableHeaders.actions")}
            </th>
          </tr>
        </thead>
        <tbody
          className={`divide-y border-t ${isDarkMode ? "border-darkthemeitems divide-darkthemeitems" : "border-gray-200"}`}
        >
          {areas.map((area) => (
            <tr key={area.id} className={`cursor-pointer ${isDarkMode ? "hover:bg-bgdarktheme" : "hover:bg-gray-50"}`}>
              <td className="px-6 py-4 font-medium" onClick={() => onEdit(area)}>
                {area.id}
              </td>
              <td className="px-6 py-4" onClick={() => onEdit(area)}>
                {area.name}
              </td>
              <td className="px-6 py-4 flex justify-end">
                {canDelete?.can && (
                  <button
                    className="btn-secondary bg-softredtheme text-redtheme hover:bg-redtheme hover:text-white p-2 text-right"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(area.id)
                    }}
                  >
                    <Trash size={15} />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Main Areas Component
export default function Areas() {
  const { t } = useTranslation()

  useEffect(() => {
    document.title = t("settingsPage.areas.pageTitle")
  }, [t])

  const { darkMode: isDarkMode } = useDarkContext()
  const { data: canCreate } = useCan({ resource: "area", action: "create" })
  const { data: canChange } = useCan({ resource: "area", action: "change" })

  const [areasAPIInfo, setAreasAPIInfo] = useState<AreasType>()
  const { data, isLoading, error } = useList({
    resource: "api/v1/bo/areas/", // Updated API endpoint for areas
    filters: [
      {
        field: "page_size",
        operator: "eq",
        value: 10,
      },
      {
        field: "page",
        operator: "eq",
        value: 1,
      },
    ],
    queryOptions: {
      onSuccess(data) {
        setAreasAPIInfo(data.data as unknown as AreasType)
      },
    },
    errorNotification(error, values, resource) {
      return {
        type: "error",
        message: error?.formattedMessage,
      }
    },
  })

  const { mutate: updateArea } = useUpdate({
    resource: `api/v1/bo/areas`, // Updated API endpoint for areas
    errorNotification(error, values, resource) {
      return {
        type: "error",
        message: error?.formattedMessage,
      }
    },
  })

  const [areas, setAreas] = useState<Area[]>(initialAreas)

  useEffect(() => {
    if (areasAPIInfo) {
      setAreas((areasAPIInfo.results as Area[]) || areasAPIInfo || [])
    }
  }, [areasAPIInfo])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedArea, setSelectedArea] = useState<Area | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const openModal = useCallback((area: Area | null) => {
    setSelectedArea(area)
    setIsModalOpen(true)
    setIsUpdating(true)
  }, [])

  const closeModal = useCallback(() => {
    setSelectedArea(null)
    setIsModalOpen(false)
  }, [])

  const [newArea, setNewArea] = useState<Area>({
    id: 0,
    name: "",
  })

  const handleInputAddChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setNewArea({ ...newArea, [e.target.id]: e.target.value })
    },
    [newArea],
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (selectedArea) {
        setSelectedArea({ ...selectedArea, [e.target.id]: e.target.value })
      }
    },
    [selectedArea],
  )

  const { mutate: addAreaMutate } = useCreate({
    errorNotification(error, values, resource) {
      return {
        type: "error",
        message: error?.formattedMessage,
      }
    },
  })

  const { mutate: deleteAreaMutate } = useDelete()

  const handleAreaUpdate = () => {
    if (selectedArea && canChange?.can) {
      updateArea({
        resource: `api/v1/bo/areas`,
        id: `${selectedArea.id}/`,
        values: {
          name: selectedArea.name,
        },
      })
      closeModal()
    }
  }

  const addAreaHandler = () => {
    if (canCreate?.can) {
      const restaurantId = localStorage.getItem("restaurant_id")
      addAreaMutate({
        resource: `api/v1/bo/areas/`,
        values: {
          name: newArea.name,
          restaurant: restaurantId ? Number.parseInt(restaurantId) : 1,
        },
      })
      closeModal()
    }
  }

  const [showPopup, setShowPopup] = useState(false)
  const [action, setAction] = useState<"delete" | "update" | "create" | "confirm">("delete")
  const [message, setMessage] = useState<string>("")
  const [areaToDelete, setAreaToDelete] = useState<BaseKey | undefined>(undefined)

  const handleDeleteRequest = (id: BaseKey) => {
    setAction("delete")
    setMessage(t("settingsPage.areas.confirmations.deleteArea"))
    setAreaToDelete(id)
    setShowPopup(true)
  }

  const deleteArea = () => {
    deleteAreaMutate(
      {
        resource: `api/v1/bo/areas`,
        id: `${areaToDelete}/`,
      },
      {
        onSuccess: () => {
          setAreaToDelete(undefined)
          setAreas(areas.filter((area) => area.id !== areaToDelete))
        },
      },
    )
  }

  const addArea = useCallback(() => {
    const newArea: Area = {
      id: 0,
      name: "",
    }
    setNewArea(newArea)
    setIsModalOpen(true)
    setIsUpdating(false)
  }, [])

  return (
    <div
      className={`w-full rounded-[10px] flex flex-col items-center p-2 ${isDarkMode ? "bg-bgdarktheme" : "bg-white"}`}
    >
      <ActionPopup
        action={action}
        message={message}
        actionFunction={() => deleteArea()}
        showPopup={showPopup}
        setShowPopup={setShowPopup}
      />
      <CanAccess resource="area" action="change">
        <AreaModal
          isOpen={isModalOpen}
          isUpdating={isUpdating}
          area={selectedArea}
          newArea={newArea}
          onClose={closeModal}
          onAddArea={addAreaHandler}
          onUpdateArea={handleAreaUpdate}
          onInputChange={handleInputChange}
          onInputAddChange={handleInputAddChange}
        />
      </CanAccess>
      <h1 className="text-2xl font-bold mb-3">{t("settingsPage.areas.title")}</h1>
      <CanAccess resource="area" action="create">
        <div>
          <button className="btn-primary mt-4" onClick={addArea}>
            {t("settingsPage.areas.buttons.addArea")}
          </button>
        </div>
      </CanAccess>
      <AreaTable areas={areas} onEdit={(area) => canChange?.can && openModal(area)} onDelete={handleDeleteRequest} />
    </div>
  )
}
