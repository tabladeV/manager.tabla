"use client"

import type React from "react"

import {
  type BaseKey,
  type BaseRecord,
  CanAccess,
  useCan,
  useCreate,
  useDelete,
  useList,
  useUpdate,
} from "@refinedev/core"
import { Trash } from "lucide-react"
import { useState, useCallback, useEffect } from "react"
import { useTranslation } from "react-i18next"
import BaseSelect from "../common/BaseSelect"
import BaseBtn from "../common/BaseBtn"
import ActionPopup from "../popup/ActionPopup"
import Pagination from "../reservation/Pagination"

interface User {
  id: number
  first_name: string
  last_name: string
  password?: string
  role?: {
    id: BaseKey
    name: string
  }
  phone?: string
  email: string
}

const initialUsers: User[] = [
  {
    id: 1,
    first_name: "",
    last_name: "",
    role: {
      id: 0,
      name: "",
    },
    phone: "",
    email: "",
  },
]

export default function Users() {
  const { t } = useTranslation()

  useEffect(() => {
    document.title = t("settingsPage.users.pageTitle")
  }, [t])

  interface RolesType {
    results: BaseRecord[]
    count: number
  }

  const [rolesAPIInfo, setRolesAPIInfo] = useState<RolesType>()
  const {
    data: rolesData,
    isLoading: rolesLoading,
    error: rolesError,
  } = useList({
    resource: "api/v1/bo/roles/",
    filters: [
      {
        field: "page_size",
        operator: "eq",
        value: 30,
      },
      {
        field: "page",
        operator: "eq",
        value: 1,
      },
    ],
    queryOptions: {
      onSuccess(data) {
        setRolesAPIInfo(data.data as unknown as RolesType)
      },
    },
  })

  interface UsersType {
    results: User[]
    count: number
  }

  const [usersAPIInfo, setUsersAPIInfo] = useState<UsersType>()
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const [count, setCount] = useState(0)

  const {
    data,
    isLoading,
    error,
    refetch: refetchUsers,
  } = useList({
    resource: "api/v1/bo/restaurants/users/",
    filters: [
      {
        field: "page_size",
        operator: "eq",
        value: size,
      },
      {
        field: "page",
        operator: "eq",
        value: page,
      },
    ],
    queryOptions: {
      onSuccess(data) {
        setUsersAPIInfo(data.data as unknown as UsersType)
      },
    },
    errorNotification(error, values, resource) {
      return {
        type: "error",
        message: error?.formattedMessage,
      }
    },
  })

  const { mutate: updateUser, isLoading: loadingUpdateUser } = useUpdate({
    resource: `api/v1/bo/restaurants/users`,
    errorNotification(error, values, resource) {
      return {
        type: "error",
        message: error?.formattedMessage,
      }
    },
  })

  const [users, setUsers] = useState<User[]>(initialUsers)

  useEffect(() => {
    if (usersAPIInfo) {
      setUsers(usersAPIInfo.results as User[])
      setCount(usersAPIInfo.count)
    }
  }, [usersAPIInfo])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const { data: userDelete } = useCan({ resource: "customuser", action: "delete" })
  const { data: userChange } = useCan({ resource: "customuser", action: "change" })

  const openModal = useCallback((user: User | null) => {
    setSelectedUser(user)
    setIsModalOpen(true)
    setIsUpdating(true)
  }, [])

  const closeModal = useCallback(() => {
    setSelectedUser(null)
    setIsModalOpen(false)
  }, [])

  const [newUser, setNewUser] = useState<User>({
    id: 0,
    first_name: "",
    last_name: "",
    password: "",
    phone: "",
    email: "",
  })

  const handleInputAddChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setNewUser({ ...newUser, [e.target.id]: e.target.value })
    },
    [newUser],
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      if (selectedUser) {
        setSelectedUser({ ...selectedUser, [e.target.id]: e.target.value })
      }
    },
    [selectedUser],
  )

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (selectedUser) {
        if (selectedUser.id) {
          setUsers(users.map((user) => (user.id === selectedUser.id ? selectedUser : user)))
        } else {
          setUsers([...users, { ...selectedUser, id: users.length + 1 }])
        }
        closeModal()
      }
    },
    [selectedUser, users, closeModal],
  )

  const [isUpdating, setIsUpdating] = useState(false)

  const addUser = useCallback(() => {
    const newUser: User = {
      id: 0,
      first_name: "",
      last_name: "",
      password: "",
      email: "",
    }
    openModal(newUser)
    setIsUpdating(false)
  }, [openModal])

  const [roleSelected, setRoleSelected] = useState<number | null>(null)

  const { mutate: updateRole, isLoading: loadingUpdateRole } = useUpdate({
    errorNotification(error, values, resource) {
      return {
        type: "error",
        message: error?.formattedMessage,
      }
    },
  })

  const { mutate: addUserMutate } = useCreate({
    errorNotification(error, values, resource) {
      return {
        type: "error",
        message: error?.formattedMessage,
      }
    },
  })

  const { mutate: deleteUserMutate } = useDelete()

  useEffect(() => setRoleSelected(selectedUser?.role?.id as number), [isModalOpen])

  const handleUserUpdate = () => {
    if (selectedUser) {
      const role = roleSelected
      updateRole({
        resource: `api/v1/bo/roles`,
        id: `${role}/assign-user/${selectedUser.id}/`,
        values: {
          // role: role?.id,
        },
      })
      updateUser(
        {
          resource: `api/v1/bo/restaurants/users`,
          id: `${selectedUser.id}/`,
          values: {
            first_name: selectedUser.first_name,
            last_name: selectedUser.last_name,
            email: selectedUser.email,
          },
        },
        {
          onSuccess() {
            closeModal()
            refetchUsers()
          },
        },
      )
    }
  }

  const adduser = () => {
    console.log(newUser)
    addUserMutate({
      resource: `api/v1/bo/restaurants/users/`,
      values: {
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
        password: newUser.password,
      },
    })
    closeModal()
  }

  const [showPopup, setShowPopup] = useState(false)
  const [message, setMessage] = useState("")
  const [action, setAction] = useState<"delete" | "update" | "create" | "confirm">("confirm")
  const [userToDelete, setUserToDelete] = useState<BaseKey | undefined>(undefined)

  const deleteRequest = (id: BaseKey) => {
    setUserToDelete(id)
    setMessage(t("settingsPage.users.confirmations.deleteUser"))
    setAction("delete")
    setShowPopup(true)
  }

  const deleteUser = () => {
    if (!userDelete?.can) return
    deleteUserMutate(
      {
        resource: `api/v1/bo/restaurants/users`,
        id: `${userToDelete}/`,
      },
      {
        onSuccess() {
          refetchUsers()
        },
      },
    )
  }

  return (
    <div className="w-full rounded-[10px] flex flex-col items-center p-2 dark:bg-bgdarktheme bg-white">
      <ActionPopup
        action={action}
        message={message}
        actionFunction={deleteUser}
        showPopup={showPopup}
        setShowPopup={setShowPopup}
      />
      {!isUpdating
        ? isModalOpen && (
            <div>
              <div className="overlay" onClick={closeModal}></div>
              <div className="sidepopup lt-sm:popup lt-sm:h-[70vh] lt-sm:bottom-0 lt-sm:rounded-b-none lt-sm:w-full h-full dark:bg-bgdarktheme bg-white">
                <h1 className="text-2xl font-bold mb-3">
                  {selectedUser?.id
                    ? t("settingsPage.users.modals.modifyUser")
                    : t("settingsPage.users.modals.addUser")}
                </h1>
                <div onSubmit={handleSubmit} className="flex flex-col gap-3">
                  <input
                    type="text"
                    id="first_name"
                    placeholder={t("settingsPage.users.form.placeholders.firstName")}
                    className="inputs dark:bg-darkthemeitems bg-white"
                    onChange={handleInputAddChange}
                    required
                  />
                  <input
                    type="text"
                    id="last_name"
                    placeholder={t("settingsPage.users.form.placeholders.lastName")}
                    className="inputs dark:bg-darkthemeitems bg-white"
                    onChange={handleInputAddChange}
                    required
                  />
                  <input
                    type="email"
                    id="email"
                    placeholder={t("settingsPage.users.form.placeholders.email")}
                    className="inputs dark:bg-darkthemeitems bg-white"
                    onChange={handleInputAddChange}
                    required
                  />
                  <input
                    type="text"
                    id="password"
                    placeholder={t("settingsPage.users.form.placeholders.password")}
                    className="inputs dark:bg-darkthemeitems bg-white"
                    onChange={handleInputAddChange}
                    required
                  />
                  <div className="flex justify-center gap-4">
                    <button
                      type="button"
                      className="btn dark:text-white dark:hover:text-redtheme dark:border-white dark:hover:border-redtheme"
                      onClick={closeModal}
                    >
                      {t("settingsPage.users.buttons.cancel")}
                    </button>
                    <button onClick={adduser} className="btn-primary">
                      {t("settingsPage.users.buttons.save")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        : isModalOpen && (
            <div>
              <div className="overlay" onClick={closeModal}></div>
              <div className="sidepopup lt-sm:popup lt-sm:h-[70vh] lt-sm:bottom-0 lt-sm:rounded-b-none lt-sm:w-full h-full dark:bg-bgdarktheme bg-white">
                <h1 className="text-2xl font-bold mb-3">
                  {selectedUser?.id
                    ? t("settingsPage.users.modals.modifyUser")
                    : t("settingsPage.users.modals.addUser")}
                </h1>
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    id="first_name"
                    placeholder={t("settingsPage.users.form.placeholders.firstName")}
                    className="inputs dark:bg-darkthemeitems bg-white"
                    value={selectedUser?.first_name || ""}
                    onChange={handleInputChange}
                    required
                  />
                  <input
                    type="text"
                    id="last_name"
                    placeholder={t("settingsPage.users.form.placeholders.lastName")}
                    className="inputs dark:bg-darkthemeitems bg-white"
                    value={selectedUser?.last_name || ""}
                    onChange={handleInputChange}
                    required
                  />
                  <input
                    type="email"
                    id="email"
                    placeholder={t("settingsPage.users.form.placeholders.email")}
                    className="inputs dark:bg-darkthemeitems bg-white"
                    value={selectedUser?.email || ""}
                    onChange={handleInputChange}
                    required
                  />
                  <BaseSelect
                    variant={localStorage.getItem("darkMode") === "true" ? "filled" : "outlined"}
                    value={roleSelected}
                    onChange={(value) => {
                      setRoleSelected(value as number | null)
                    }}
                    options={
                      rolesAPIInfo?.results?.map((role: any) => ({
                        label: role.name,
                        value: role.id,
                      })) || []
                    }
                  />
                  <div className="flex justify-center gap-4">
                    <BaseBtn
                      onClick={() => handleUserUpdate()}
                      className="w-full"
                      loading={loadingUpdateUser || loadingUpdateRole}
                    >
                      {t("settingsPage.users.buttons.save")}
                    </BaseBtn>
                  </div>
                </div>
              </div>
            </div>
          )}
      <h1 className="text-2xl font-bold mb-3">{t("settingsPage.users.title")}</h1>
      <div>
        <button className="btn-primary mt-4" onClick={addUser}>
          {t("settingsPage.users.buttons.addUser")}
        </button>
      </div>
      <div className="overflow-x-auto w-full">
        <table className="w-full border-collapse text-left text-sm dark:bg-bgdarktheme2 bg-white text-gray-500">
          <thead className="dark:bg-bgdarktheme bg-white text-gray-900 dark:text-gray-100">
            <tr>
              <th scope="col" className="px-6 py-4 font-medium">
                {t("settingsPage.users.tableHeaders.id")}
              </th>
              <th scope="col" className="px-6 py-4 font-medium">
                {t("settingsPage.users.tableHeaders.name")}
              </th>
              <th scope="col" className="px-6 py-4 font-medium">
                {t("settingsPage.users.tableHeaders.email")}
              </th>
              <th scope="col" className="px-6 py-4 font-medium">
                {t("settingsPage.users.tableHeaders.role")}
              </th>
              <th scope="col" className="px-6 py-4 font-medium flex justify-end">
                {t("settingsPage.users.tableHeaders.actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y border-t dark:border-darkthemeitems border-gray-200">
            {users.map((user) => (
              <tr
                key={user.id}
                className="cursor-pointer dark:text-gray-200 dark:hover:bg-bgdarktheme dark:border-greentheme/40 hover:bg-gray-50"
              >
                <td className="px-6 py-4 font-medium" onClick={() => openModal(user)}>
                  {user.id}
                </td>
                <td className="px-6 py-4" onClick={() => openModal(user)}>
                  {user.first_name} {user.last_name}
                </td>
                <td className="px-6 py-4" onClick={() => openModal(user)}>
                  {user.email}
                </td>
                <td className="px-6 py-4" onClick={() => openModal(user)}>
                  {user.role ? user.role.name : t("settingsPage.users.table.noRole")}
                </td>
                <td className="px-6 py-4 flex justify-end">
                  <CanAccess resource="customuser" action="delete">
                    <button
                      className="btn-secondary bg-softredtheme text-redtheme hover:bg-redtheme hover:text-white p-2 text-right"
                      onClick={() => {
                        deleteRequest(user.id)
                      }}
                    >
                      <Trash size={15} />
                    </button>
                  </CanAccess>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        setPage={(page: number) => {
          setPage(page)
        }}
        size={size}
        count={count}
      />
    </div>
  )
}
