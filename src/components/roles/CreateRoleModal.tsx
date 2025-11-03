"use client"

import type React from "react"
import { useState } from "react"
import { CanAccess, useCreate, type BaseKey } from "@refinedev/core"
import { ArrowDown, ArrowUp, Undo, X } from "lucide-react"
import SearchBar from "../header/SearchBar"
import { useTranslation } from "react-i18next"
import Portal from "../common/Portal"

interface PermissionType {
  id: number
  name: string
  value: boolean
}

interface RoleType {
  id: BaseKey
  name: string
  permissions: PermissionType[]
}

interface CreateRoleModalProps {
  availablePermissions?: PermissionType[]
  onClose?: () => void
}

const CreateRoleModal = ({ availablePermissions = [], onClose }: CreateRoleModalProps) => {
  const [roleName, setRoleName] = useState("")
  const [allPermissions, setAllPermissions] = useState<PermissionType[]>(
    availablePermissions.map((perm) => ({
      ...perm,
      value: false,
    })),
  )

  const { t } = useTranslation()

  // Function to toggle a permission's value
  const handleTogglePermission = (permissionId: number) => {
    setAllPermissions(
      allPermissions.map((permission) =>
        permission.id === permissionId ? { ...permission, value: !permission.value } : permission,
      ),
    )
  }

  const { mutate: createRole } = useCreate({
    errorNotification(error, values, resource) {
      return {
        type: "error",
        message: error?.formattedMessage,
      }
    },
  })

  const handleSaveChanges = () => {
    if (!roleName.trim()) {
      // Show error for empty role name
      return
    }

    const newRole = {
      name: roleName,
      permissions: allPermissions.filter((permission) => permission.value).map((permission) => permission.id),
    }

    createRole({
      resource: "api/v1/bo/roles/",
      values: newRole,
    })
    onClose?.()
  }

  const [searchTerm, setSearchTerm] = useState("")

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase())
  }

  const filteredPermissions = allPermissions.filter((permission) => permission.name.toLowerCase().includes(searchTerm))

  // Function to reset permissions
  const resetPermissions = () => {
    setAllPermissions(
      availablePermissions.map((perm) => ({
        ...perm,
        value: false,
      })),
    )
  }

  // Function to enable all permissions
  const handleAllPermissions = () => {
    setAllPermissions(allPermissions.map((permission) => ({ ...permission, value: true })))
  }

  // Function to disable all permissions
  const handleAllPermissionsRemove = () => {
    setAllPermissions(allPermissions.map((permission) => ({ ...permission, value: false })))
  }

  return (
    <Portal>
    <div className="flex flex-col overflow-y-auto h-full bg-white dark:bg-bgdarktheme border-l dark:border-zinc-800 sidepopup z-[360] lt-sm:bottom-0 lt-sm:w-full rounded-[10px] shadow-lg shadow-[#00000008]">
      <div className="p-2 border-b flex justify-between items-center dark:border-zinc-800">
        <h1 className="text-xl font-semibold">{t("roles.createRole", "Create Role")}</h1>
        <X onClick={onClose} className="absolute top-4 right-4 cursor-pointer" size={20} />
      </div>

      <div className="flex flex-col no-scrollbar overflow-y-scroll">
        <div className="p-6">
          <div className="mb-6">
            <label htmlFor="roleName" className="block text-sm font-medium mb-2">
              {t("roles.roleName", "Role Name")}
            </label>
            <input
              type="text"
              id="roleName"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="w-full p-2 border dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8bc34a] dark:bg-bgdarktheme"
              placeholder="Enter role name"
            />
          </div>

          <h2 className="text-lg font-medium mb-2">{t("roles.permissions", "Permissions")}</h2>
          <SearchBar
            SearchHandler={handleSearch}
            append={
              <div className="flex items-center gap-2">
                <button className="btn-icon" onClick={handleAllPermissions} title="Enable all permissions">
                  <ArrowUp size={18} />
                </button>
                <button className="btn-icon" onClick={resetPermissions} title="Reset permissions">
                  <Undo size={18} />
                </button>
                <button className="btn-icon" onClick={handleAllPermissionsRemove} title="Disable all permissions">
                  <ArrowDown size={18} />
                </button>
              </div>
            }
          />
          <div className="max-h-[45vh] overflow-y-auto pr-2">
            <div className="space-y-2">
              {filteredPermissions.length > 0 ? (
                filteredPermissions.map((permission) => (
                  <div
                    key={permission.id}
                    className={`flex items-center justify-between p-3 rounded-lg border dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-${permission.value ? "softgreentheme" : "softredtheme"} transition-colors`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{permission.name}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer "
                        checked={permission.value}
                        onChange={() => handleTogglePermission(permission.id)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#a3d76d] dark:peer-focus:ring-[#4e6b3e] rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-[#4e6b3e] peer-checked:bg-[#8bc34a]"></div>
                    </label>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                  {t("roles.noPermissionsFound", "No permissions found")}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 border-t dark:border-zinc-800 mt-auto">
        <div className="flex justify-end gap-3">
            <button
                type="button"
                onClick={onClose}
                className="btn dark:text-white dark:hover:border-softwhitetheme transition-colors"
            >
                {t("common.cancel", "Cancel")}
            </button>
            <CanAccess resource="role" action="create">
                <button
                    type="button"
                    className="btn-primary transition-colors"
                    onClick={handleSaveChanges}
                    disabled={!roleName.trim()}
                >
                    {t("roles.createRole", "Create Role")}
                </button>
            </CanAccess>
        </div>
      </div>
    </div>
    </Portal>
  )
}

export default CreateRoleModal