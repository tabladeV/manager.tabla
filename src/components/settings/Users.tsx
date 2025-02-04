import { useList } from "@refinedev/core"
import { useState, useCallback, useEffect } from "react"
import { useTranslation } from "react-i18next"

interface User {
  id: number
  first_name: string
  last_name: string
  role: string
  phone: string
  email: string
}

const initialUsers: User[] = [
  {
    id: 1,
    first_name: 'John',
    last_name: 'Doe',
    role: 'Manager',
    phone: '1234567890',
    email: 'JohnDoe@gmail.com',
  }
]

export default function Users() {

  const{data, isLoading, error} = useList({
    resource: 'api/v1/api/v1/bo/restaurants/users',
    meta: {
      headers: {
        'X-Restaurant-ID': 1
      }
    }
  })

  console.log('users',data?.data)


  const [users, setUsers] = useState<User[]>(initialUsers)
  useEffect(() => {
    if (data?.data) {
      setUsers(data.data as User[])
    }
  }, [data])
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
      first_name: '',
      last_name: '',
      role: '',
      phone: '',
      email: '',
    }
    openModal(newUser)
  }, [openModal])

  const {t}= useTranslation();

  return (
    <div className={`w-full rounded-[10px] flex flex-col items-center p-10 ${localStorage.getItem('darkMode')==='true'?'bg-bgdarktheme':'bg-white'}`}>
      {isModalOpen && (
        <div >
          <div className="overlay" onClick={closeModal}></div>
          <div className={`sidepopup lt-sm:popup lt-sm:h-[70vh] lt-sm:bottom-0 lt-sm:rounded-b-none lt-sm:w-full h-full ${localStorage.getItem('darkMode')==='true'?'bg-bgdarktheme':'bg-white'}`}>
            <h1 className="text-2xl font-bold mb-3">{selectedUser?.id ? 'Modify' : 'Add'} User</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input type="text" id="name" placeholder="Name" className={`inputs ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems':'bg-white'}`} value={selectedUser?.first_name || ''} onChange={handleInputChange} required />
              {/* <input type="tel" id="phoneNumber" placeholder="Phone Number" className={`inputs ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems':'bg-white'}`} value={selectedUser?.phone || ''} onChange={handleInputChange} /> */}
              <input type="email" id="email" placeholder="Email" className={`inputs ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems':'bg-white'}`} value={selectedUser?.email || ''} onChange={handleInputChange} required />
              <select id="groups" className={`inputs ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems':'bg-white'}`} value={selectedUser?.role || ''} onChange={handleInputChange}>
                <option value="Manager">Manager</option>
                <option value="Staff">Staff</option>
              </select>
              <div className="flex justify-center gap-4">
                <button type="button" className={localStorage.getItem('darkMode')==='true'?'btn text-white hover:text-redtheme border-white hover:border-redtheme':'btn'} onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <h1 className="text-2xl font-bold mb-3">{t('settingsPage.users.title')}</h1>
      <div className="overflow-x-auto w-full">
        <table className={`w-full border-collapse text-left text-sm  ${localStorage.getItem('darkMode')==='true'?'bg-bgdarktheme2':'bg-white text-gray-500'}`}>
          <thead className={`${localStorage.getItem('darkMode')==='true'?'bg-bgdarktheme text-white':'bg-white text-gray-900'}`}>
            <tr>
              <th scope="col" className="px-6 py-4 font-medium ">{t('settingsPage.users.tableHeaders.id')}</th>
              <th scope="col" className="px-6 py-4 font-medium ">{t('settingsPage.users.tableHeaders.name')}</th>
              {/* <th scope="col" className="px-6 py-4 font-medium ">{t('settingsPage.users.tableHeaders.phone')}</th> */}
              <th scope="col" className="px-6 py-4 font-medium ">{t('settingsPage.users.tableHeaders.email')}</th>
              <th scope="col" className="px-6 py-4 font-medium ">{t('settingsPage.users.tableHeaders.role')}</th>
            </tr>
          </thead>
          <tbody className={`divide-y  border-t ${localStorage.getItem('darkMode')==='true'?'border-darkthemeitems divide-darkthemeitems':'border-gray-200'}`}>
            {users.map((user) => (
              <tr key={user.id} className={` cursor-pointer ${localStorage.getItem('darkMode')==='true'?'hover:bg-bgdarktheme':'hover:bg-gray-50'}`} onClick={() => openModal(user)}>
                <td className="px-6 py-4 font-medium">{user.id}</td>
                <td className="px-6 py-4">{user.first_name} {user.last_name}</td>
                {/* <td className="px-6 py-4">{user.phone}</td> */}
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">{user.role}</td>
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