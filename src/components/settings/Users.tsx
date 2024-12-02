import { useState, useCallback } from "react"
import { useTranslation } from "react-i18next"

interface User {
  id: number
  name: string
  role: string
  phoneNumber: string
  email: string
  status: "At Work" | "Rest"
}

const initialUsers: User[] = [
  {
    id: 1,
    name: 'John Doe',
    role: 'Designer',
    phoneNumber: '1234567890',
    email: 'JohnDoe@gmail.com',
    status: 'At Work',
  },
  {
    id: 2,
    name: 'Jane Doe',
    role: 'Developer',
    phoneNumber: '1234567890',
    email: 'jane@gmail.com',
    status: 'At Work',
  },
  {
    id: 3,
    name: 'Chris Diaz',
    role: 'Designer',
    phoneNumber: '1234567890',
    email: 'Chris@gmail.com',
    status: 'Rest',
  }
]

export default function Users() {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const openModal = useCallback((user: User | null) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setSelectedUser(null)
    setIsModalOpen(false)
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (selectedUser) {
      setSelectedUser({ ...selectedUser, [e.target.id]: e.target.value })
    }
  }, [selectedUser])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (selectedUser) {
      if (selectedUser.id) {
        setUsers(users.map(user => user.id === selectedUser.id ? selectedUser : user))
      } else {
        setUsers([...users, { ...selectedUser, id: users.length + 1 }])
      }
      closeModal()
    }
  }, [selectedUser, users, closeModal])

  const addUser = useCallback(() => {
    const newUser: User = {
      id: 0,
      name: '',
      role: '',
      phoneNumber: '',
      email: '',
      status: 'At Work',
    }
    openModal(newUser)
  }, [openModal])

  const {t}= useTranslation();

  return (
    <div className="bg-white w-full rounded-[10px] flex flex-col items-center p-10">
      {isModalOpen && (
        <div >
          <div className="overlay" onClick={closeModal}></div>
          <div className="sidepopup lt-sm:popup lt-sm:h-[70vh] lt-sm:bottom-0 lt-sm:rounded-b-none lt-sm:w-full h-full">
            <h1 className="text-2xl font-bold mb-3">{selectedUser?.id ? 'Modify' : 'Add'} User</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input type="text" id="name" placeholder="Name" className="inputs" value={selectedUser?.name || ''} onChange={handleInputChange} required />
              <input type="tel" id="phoneNumber" placeholder="Phone Number" className="inputs" value={selectedUser?.phoneNumber || ''} onChange={handleInputChange} required />
              <input type="email" id="email" placeholder="Email" className="inputs" value={selectedUser?.email || ''} onChange={handleInputChange} required />
              <input type="text" id="role" placeholder="Role" className="inputs" value={selectedUser?.role || ''} onChange={handleInputChange} required />
              <select id="status" className="inputs" value={selectedUser?.status || 'At Work'} onChange={handleInputChange}>
                <option value="At Work">At Work</option>
                <option value="Rest">Rest</option>
              </select>
              <div className="flex justify-center gap-4">
                <button type="button" className="btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <h1 className="text-2xl font-bold mb-3">{t('settingsPage.users.title')}</h1>
      <div className="overflow-x-auto w-full">
        <table className="w-full border-collapse bg-white text-left text-sm text-gray-500">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-4 font-medium text-gray-900">{t('settingsPage.users.tableHeaders.id')}</th>
              <th scope="col" className="px-6 py-4 font-medium text-gray-900">{t('settingsPage.users.tableHeaders.name')}</th>
              <th scope="col" className="px-6 py-4 font-medium text-gray-900">{t('settingsPage.users.tableHeaders.phone')}</th>
              <th scope="col" className="px-6 py-4 font-medium text-gray-900">{t('settingsPage.users.tableHeaders.email')}</th>
              <th scope="col" className="px-6 py-4 font-medium text-gray-900">{t('settingsPage.users.tableHeaders.role')}</th>
              <th scope="col" className="px-6 py-4 font-medium text-gray-900">{t('settingsPage.users.tableHeaders.status')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 border-t border-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => openModal(user)}>
                <td className="px-6 py-4 font-medium text-gray-900">{user.id}</td>
                <td className="px-6 py-4">{user.name}</td>
                <td className="px-6 py-4">{user.phoneNumber}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">{user.role}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      user.status === "At Work"
                        ? "bg-softgreentheme text-greentheme"
                        : "bg-softredtheme text-redtheme"
                    }`}
                  >
                    {user.status === "At Work" ? t('settingsPage.users.statusLabels.working') : t('settingsPage.users.statusLabels.rest')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <button className="btn-primary mt-4" onClick={addUser}>{t('settingsPage.users.buttons.addUser')}</button>
      </div>
    </div>
  )
}