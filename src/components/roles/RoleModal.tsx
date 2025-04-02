"use client"

import { useState } from "react"
import { useUpdate, type BaseKey } from "@refinedev/core"
import { ArrowDown, ArrowUp, Plus, StopCircle, Trash, Undo, X } from "lucide-react"
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
  const [currentPermissions, setCurrentPermissions] = useState<PermissionType[]>(role?.permissions || [])
  const [availablePerms, setAvailablePerms] = useState<PermissionType[]>(
    availablePermissions.filter((ap) => !currentPermissions.some((cp) => cp.id === ap.id)),
  )

  // Function to remove a permission from the role
  const handleRemovePermission = (permissionId: number) => {
    const removedPermission = currentPermissions.find((p) => p.id === permissionId)

    if (removedPermission) {
      setCurrentPermissions(currentPermissions.filter((p) => p.id !== permissionId))
      setAvailablePerms([...availablePerms, removedPermission])
    }
  }

  // Function to add a permission to the role
  const handleAddPermission = (permissionId: number) => {
    const permissionToAdd = availablePerms.find((p) => p.id === permissionId)

    if (permissionToAdd) {
      setAvailablePerms(availablePerms.filter((p) => p.id !== permissionId))
      setCurrentPermissions([...currentPermissions, permissionToAdd])
    }
  }

  const { mutate: updateWidget } = useUpdate({
    errorNotification(error, values, resource) {
      return {
        type: 'error',
        message: error?.formattedMessage,
      };
    },
  });

  const handleSaveChanges = () => {
    const updatedRole = {
      permissions: currentPermissions.map((permission) => permission.id),
    }

    updateWidget({
      resource: "api/v1/bo/roles",
      id: role?.id+'/',
      values: updatedRole,
    })
    onClose?.()
  }



  // Function to get initials for the avatar
  const getInitials = (name: string) => {
    return name.slice(0, 1).toUpperCase()
  }

    const handleSearchAvailable = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchTerm = e.target.value
        if (searchTerm === "") {
            setAvailablePerms(availablePermissions.filter((ap) => !currentPermissions.some((cp) => cp.id === ap.id)))
        } else {
            const filteredPermissions = availablePermissions.filter((permission) =>
            permission.name.toLowerCase().includes(searchTerm.toLowerCase()),
            )
            setAvailablePerms(filteredPermissions) 
        }
    }

    const handleSearchAffected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchTerm = e.target.value
        if (searchTerm === "") {
            setCurrentPermissions(role?.permissions || [])
        } else {
            const filteredPermissions = role?.permissions.filter((permission) =>
            permission.name.toLowerCase().includes(searchTerm.toLowerCase()),
            )
            setCurrentPermissions(filteredPermissions || [])
        }
    }


    // Function to reset permissions
    const resetPermissions = () => {
        setCurrentPermissions(role?.permissions || [])
        setAvailablePerms(availablePermissions.filter((ap) => !currentPermissions.some((cp) => cp.id === ap.id)))
    }

    // Function to handle all permissions to be added
    const handleAllPermissions = () => {
        setCurrentPermissions(availablePermissions)
        setAvailablePerms([])
    }
    // Function to handle all permissions to be removed
    const handleAllPermissionsRemove = () => {
        setCurrentPermissions([])
        setAvailablePerms(availablePermissions)
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
        {/* Current Permissions Section */}
        <div className="p-6">
          <h2 className="text-lg font-medium mb-2">Current Permissions</h2>
          <SearchBar SearchHandler={handleSearchAffected}  />
          <div className="max-h-[30vh] overflow-y-auto pr-2">
            <div className="space-y-2">
              {currentPermissions.length > 0 ? (
                currentPermissions.map((permission) => (
                  <div
                    key={permission.id}
                    className="flex items-center justify-between p-3 rounded-lg border dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-softredtheme transition-colors"
                  >
                    <div className="flex items-center gap-3">
                    
                      <span className="font-medium">{permission.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePermission(permission.id)}
                      className="p-2 rounded-full text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      aria-label="Remove permission"
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                  No permissions assigned to this role
                </div>
              )}
            </div>
          </div>
        </div>

        <hr className="mx-6 border-t border-zinc-200 dark:border-zinc-800" />
        <div className="flex justify-center items-center p-3">
            <button
                className="btn-primary flex gap-2 items-center mt-3 mx-6"
                onClick={() => {
                    handleAllPermissions()
                }}
            >
                All <ArrowUp size={18} />
            </button>
            <button
                className="btn  flex gap-2 items-center mt-3 mx-6"
                onClick={resetPermissions}
            >
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
        </div>
        <hr className="mx-6 border-t border-zinc-200 dark:border-zinc-800" />

        {/* Available Permissions Section */}
        <div className="p-6">
          <h2 className="text-lg font-medium mb-3">Available Permissions</h2>
            <SearchBar SearchHandler={handleSearchAvailable}  />
          <div className="max-h-[30vh] overflow-y-auto pr-2">
            <div className="space-y-2">
              {availablePerms.length > 0 ? (
                availablePerms.map((permission) => (
                  <div
                    key={permission.id}
                    className="flex items-center justify-between p-3 rounded-lg border dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-softgreentheme transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      
                      <span className="font-medium">{permission.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddPermission(permission.id)}
                      className="p-2 rounded-full text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                      aria-label="Add permission"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                  No additional permissions available
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
            className="btn  dark:text-white dark:hover:border-softwhitetheme transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary transition-colors"
            onClick={handleSaveChanges}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

export default RoleModal

