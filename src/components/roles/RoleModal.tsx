"use client"

import type React from "react"

import { useState } from "react"
import { useUpdate, type BaseKey } from "@refinedev/core"
import { ArrowDown, ArrowUp, Undo, X } from "lucide-react"
import SearchBar from "../header/SearchBar"

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

interface RoleModalProps {
  role?: RoleType | null
  availablePermissions?: PermissionType[]
  onClose?: () => void
}

const RoleModal = ({ role, availablePermissions = [], onClose }: RoleModalProps) => {
  const [allPermissions, setAllPermissions] = useState<PermissionType[]>(
    [
      ...(role?.permissions || []),
      ...availablePermissions.filter((ap) => !role?.permissions.some((rp) => rp.id === ap.id)),
    ].map((perm) => ({
      ...perm,
      value: role?.permissions.some((rp) => rp.id === perm.id) || false,
    })),
  )

  // Function to toggle a permission's value
  const handleTogglePermission = (permissionId: number) => {
    setAllPermissions(
      allPermissions.map((permission) =>
        permission.id === permissionId ? { ...permission, value: !permission.value } : permission,
      ),
    )
  }

  const { mutate: updateWidget } = useUpdate({
    errorNotification(error, values, resource) {
      return {
        type: "error",
        message: error?.formattedMessage,
      }
    },
  })

  const handleSaveChanges = () => {
    const updatedRole = {
      permissions: allPermissions.filter((permission) => permission.value).map((permission) => permission.id),
    }

    updateWidget({
      resource: "api/v1/bo/roles",
      id: role?.id + "/",
      values: updatedRole,
    })
    onClose?.()
  }

  // Function to get initials for the avatar
  const getInitials = (name: string) => {
    return name.slice(0, 1).toUpperCase()
  }

  const [searchTerm, setSearchTerm] = useState("")

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase())
  }

  const filteredPermissions = allPermissions.filter((permission) => permission.name.toLowerCase().includes(searchTerm))

  // Function to reset permissions
  const resetPermissions = () => {
    setAllPermissions(
      [
        ...(role?.permissions || []),
        ...availablePermissions.filter((ap) => !role?.permissions.some((rp) => rp.id === ap.id)),
      ].map((perm) => ({
        ...perm,
        value: role?.permissions.some((rp) => rp.id === perm.id) || false,
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
    <div className="flex flex-col overflow-y-auto h-full bg-white dark:bg-bgdarktheme border-l dark:border-zinc-800  sidepopup z-[360]  lt-sm:bottom-0 lt-sm:w-full rounded-[10px] shadow-lg shadow-[#00000008]">
      <div className="p-2 border-b flex justify-between items-center dark:border-zinc-800">
        <h1 className="text-xl font-semibold">
          Edit Role: <span className="font-[500] italic">{role?.name}</span>
        </h1>
        <X onClick={onClose} className="absolute top-4 right-4 cursor-pointer" size={20} />
      </div>

      <div className="flex flex-col no-scrollbar overflow-y-scroll">
        <div className="p-6">
          <h2 className="text-lg font-medium mb-2">Permissions</h2>
          <SearchBar SearchHandler={handleSearch} />
          <div className="max-h-[60vh] overflow-y-auto pr-2">
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
                <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">No permissions found</div>
              )}
            </div>
          </div>
        </div>
{/* 
        <div className="flex justify-center items-center p-3">
          <button
            className="btn-primary flex gap-2 items-center mt-3 mx-6"
            onClick={() => {
              handleAllPermissions()
            }}
          >
            All <ArrowUp size={18} />
          </button>
          <button className="btn  flex gap-2 items-center mt-3 mx-6" onClick={resetPermissions}>
            Reset <Undo size={18} />
          </button>
          <button
            className="btn-danger flex gap-2 items-center mt-3 mx-6"
            onClick={() => {
              handleAllPermissionsRemove()
            }}
          >
            All <ArrowDown size={18} />
          </button>
        </div> */}
      </div>

      <div className="p-3 border-t dark:border-zinc-800 mt-auto">
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn  dark:text-white dark:hover:border-softwhitetheme transition-colors"
          >
            Cancel
          </button>
          <button type="button" className="btn-primary transition-colors" onClick={handleSaveChanges}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

export default RoleModal

