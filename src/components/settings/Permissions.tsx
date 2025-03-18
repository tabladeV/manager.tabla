import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { useDarkContext } from "../../context/DarkContext"

const Permissions = () => {
  const { t } = useTranslation()
  const { darkMode } = useDarkContext()

  // Sample data for users and roles
  const [users, setUsers] = useState([
    { id: 1, name: "John Doe", role: "" },
    { id: 2, name: "Jane Smith", role: "" },
    { id: 3, name: "Mike Johnson", role: "" },
  ])

  const roles = ["Admin", "Manager", "Staff"]

  const handleRoleChange = (userId: number, newRole: string) => {
    setUsers(users.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))
  }

  return (
    <div className="rounded-[10px] p-3 w-full bg-white dark:bg-bgdarktheme">
      <h2 className="text-center mb-3">{t("settingsPage.permissions.title")}</h2>

      <div className="mt-4">
        <table className="w-full border-collapse text-black dark:text-white">
          <thead>
            <tr>
              <th className="text-left p-2 border-b">{t("settingsPage.permissions.labels.user")}</th>
              <th className="text-left p-2 border-b">{t("settingsPage.permissions.labels.role")}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="p-2 border-b">{user.name}</td>
                <td className="p-2 border-b">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="w-full p-2 rounded bg-white dark:bg-darkthemeitems text-black dark:text-white"
                  >
                    <option value="">{t("settingsPage.permissions.labels.selectRole")}</option>
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <h3 className="text-[20px] mb-3">{t("settingsPage.permissions.labels.assignedRoles")}</h3>
        <div className="rounded-md p-3 bg-softgreytheme dark:bg-bgdarktheme2">
          {users.some((user) => user.role) ? (
            <ul>
              {users
                .filter((user) => user.role)
                .map((user) => (
                  <li key={user.id} className="mb-2">
                    {user.name}: <strong>{user.role}</strong>
                  </li>
                ))}
            </ul>
          ) : (
            <p>{t("settingsPage.permissions.labels.noAssignedRoles")}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Permissions

