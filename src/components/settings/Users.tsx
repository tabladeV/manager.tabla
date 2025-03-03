import { BaseKey, BaseRecord, useCreate, useDelete, useList, useUpdate } from "@refinedev/core"
import { Trash } from "lucide-react"
import { useState, useCallback, useEffect } from "react"
import { useTranslation } from "react-i18next"

interface User {
  id: number
  first_name: string
  last_name: string
  password?: string
  role?: {
    id: BaseKey,
    name: string
  }
  phone?: string
  email: string
}

const initialUsers: User[] = [
  {
    id: 1,
    first_name: '',
    last_name: '',
    role: {
      id: 0,
      name: ''
    },
    phone: '',
    email: '',
  }
]

export default function Users() {

  
  useEffect(() => {
    document.title = 'Users Management | Tabla'
  }, [])

  interface RolesType {
    
    results: BaseRecord[]
    count: number
    
  }

  const [rolesAPIInfo, setRolesAPIInfo] =useState<RolesType>()

  const {data:rolesData, isLoading:rolesLoading, error:rolesError} = useList({
    resource: 'api/v1/bo/roles/',
    filters: [
      {
        field: "page_size",
        operator: "eq",
        value: 20
      },
      {
        field: "page",
        operator: "eq",
        value: 1
      }
    ],
    queryOptions:{
      onSuccess(data){
        setRolesAPIInfo(data.data as unknown as RolesType)
      }
    }

  })

  interface UsersType {
    
    results: User[]
    count: number
    
  }

  const [usersAPIInfo, setUsersAPIInfo] =useState<UsersType>()

  const{data, isLoading, error} = useList({
    resource: 'api/v1/bo/restaurants/users/',
    filters: [
      {
        field: "page_size",
        operator: "eq",
        value: 10
      },
      {
        field: "page",
        operator: "eq",
        value: 1
      }
    ],
    queryOptions:{
      onSuccess(data){
        setUsersAPIInfo(data.data as unknown as UsersType)
      }
    }

  })


  const{mutate: updateUser} = useUpdate({
    resource: `api/v1/bo/restaurants/users`,

  });





  const [users, setUsers] = useState<User[]>(initialUsers)
  useEffect(() => {
    if (usersAPIInfo) {
      setUsers(usersAPIInfo.results as User[])
    }
  }, [usersAPIInfo])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const openModal = useCallback((user: User | null) => {
    setSelectedUser(user)
    setIsModalOpen(true)
    setIsUpdating(true)
  }, [])

  const closeModal = useCallback(() => {
    setSelectedUser(null)
    setIsModalOpen(false)
  }, [])

  const [newUser, setNewUser] = useState<User>(
    {
      id: 0,
      first_name: '',
      last_name: '',
      password: '',
      phone: '',
      email: '',
    }
  )

  const handleInputAddChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewUser({ ...newUser, [e.target.id]: e.target.value })
  }, [newUser])

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

  const [isUpdating, setIsUpdating] = useState(false)

  const addUser = useCallback(() => {
    const newUser: User = {
      id: 0,
      first_name: '',
      last_name: '',
      password: '',
      email: '',
    }
    openModal(newUser)
    setIsUpdating(false)
  }, [openModal])

  const {t}= useTranslation();

  const [roleSelected, setRoleSelected] = useState<string>()
  useEffect(() => {
    setRoleSelected(selectedUser?.role?.id.toString())
  }, [roleSelected])

  console.log(selectedUser?.role?.id,'newId')

  const {mutate: updateRole} = useUpdate();
  const {mutate: addUserMutate} = useCreate();
  const {mutate: deleteUserMutate} = useDelete();

  useEffect(() => {
    setRoleSelected((document.getElementById('roleUpdate') as HTMLSelectElement)?.value || '')
  }, [])
  console.log('roleSelected',roleSelected)

  const handleUserUpdate = () => {


    if (selectedUser) {
      const role = selectedUser?.role?.id
      console.log('role',role)
      updateRole({
        resource: `api/v1/bo/roles`,
        id: `${role}/assign-user/${selectedUser.id}/`,
        values: {
          // role: role?.id,
        },
        
      });
      updateUser({
        resource: `api/v1/api/v1/bo/restaurants/users`,
        id: `${selectedUser.id}/`,
        values: {
          first_name: selectedUser.first_name,
          last_name: selectedUser.last_name,
          email: selectedUser.email,
        },
      });
      // setIsUpdating(false);
      // setIsModalOpen(false);
      

    }
  };

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
    });
    closeModal();
  }

  const deleteUser = (id:BaseKey) => {
    if(window.confirm('Are you sure you want to delete this user?')){
      deleteUserMutate({
        resource: `api/v1/api/v1/bo/restaurants/users`,
        id: `${id}/`,
      });
    }
  }



  return (
    <div className={`w-full rounded-[10px] flex flex-col items-center p-10 ${localStorage.getItem('darkMode')==='true'?'bg-bgdarktheme':'bg-white'}`}>
      {( !isUpdating ) ? (isModalOpen && (
        <div >
          <div className="overlay" onClick={closeModal}></div>
          <div className={`sidepopup lt-sm:popup lt-sm:h-[70vh] lt-sm:bottom-0 lt-sm:rounded-b-none lt-sm:w-full h-full ${localStorage.getItem('darkMode')==='true'?'bg-bgdarktheme':'bg-white'}`}>
            <h1 className="text-2xl font-bold mb-3">{selectedUser?.id ? 'Modify' : 'Add'} User</h1>
            <div onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input type="text" id="first_name" placeholder="first Name" className={`inputs ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems':'bg-white'}`} onChange={handleInputAddChange} required />
              <input type="text" id="last_name" placeholder="Last Name" className={`inputs ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems':'bg-white'}`}  onChange={handleInputAddChange} required />
              <input type="email" id="email" placeholder="Email" className={`inputs ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems':'bg-white'}`}  onChange={handleInputAddChange} required />
              <input type="text" id="password" placeholder="Password" className={`inputs ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems':'bg-white'}`}  onChange={handleInputAddChange} required />
              {/* <select id="role" className={`inputs ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems':'bg-white'}`} onChange={handleInputAddChange}>
              {
                rolesData?.data.map((role:any)=>(
                  <option key={role.id} value={role.name}>{role.name}</option>
                ))
                }
              </select> */}
              <div className="flex justify-center gap-4">
                <button type="button" className={localStorage.getItem('darkMode')==='true'?'btn text-white hover:text-redtheme border-white hover:border-redtheme':'btn'} onClick={closeModal}>Cancel</button>
                <button onClick={adduser} className="btn-primary">Save</button>
              </div>
            </div>
          </div>
        </div>
      )): isModalOpen && (
        <div >
          <div className="overlay" onClick={closeModal}></div>
          <div className={`sidepopup lt-sm:popup lt-sm:h-[70vh] lt-sm:bottom-0 lt-sm:rounded-b-none lt-sm:w-full h-full ${localStorage.getItem('darkMode')==='true'?'bg-bgdarktheme':'bg-white'}`}>
            <h1 className="text-2xl font-bold mb-3">{selectedUser?.id ? 'Modify' : 'Add'} User</h1>
            <div className="flex flex-col gap-3">
              <input type="text" id="first_name" placeholder="first Name" className={`inputs ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems':'bg-white'}`} value={selectedUser?.first_name || ''} onChange={handleInputChange} required />
              <input type="text" id="last_name" placeholder="Last Name" className={`inputs ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems':'bg-white'}`} value={selectedUser?.last_name || ''} onChange={handleInputChange} required />
              {/* <input type="tel" id="phoneNumber" placeholder="Phone Number" className={`inputs ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems':'bg-white'}`} value={selectedUser?.phone || ''} onChange={handleInputChange} /> */}
              <input type="email" id="email" placeholder="Email" className={`inputs ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems':'bg-white'}`} value={selectedUser?.email || ''} onChange={handleInputChange} required />
              <select
                id="roleUpdate"
                className={`inputs ${localStorage.getItem('darkMode')==='true' ? 'bg-darkthemeitems' : 'bg-white'}`}
                defaultValue={roleSelected || selectedUser?.role?.id } // Ensure the value is ID, not name
                onChange={(e) => {
                  const selectedRole = rolesAPIInfo?.results.find((role: any) => role.id === Number(e.target.value));
                  if (selectedUser && selectedRole) {
                    setSelectedUser({ ...selectedUser, role: { ...selectedUser.role, id: selectedRole.id as BaseKey, name: selectedRole.name } });
                  }
                }} // Set role ID
              >
                {
                  rolesAPIInfo?.results.map((role: any) => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))
                }
              </select>
              <div className="flex justify-center gap-4">
                {/* <button onClick={deleteUser} className="btn-primary">Delete</button> */}
                {/* <button type="button"  className={localStorage.getItem('darkMode')==='true'?'btn text-white hover:text-redtheme border-white hover:border-redtheme':'btn'} onClick={closeModal}>Cancel</button> */}
                <button onClick={handleUserUpdate} className="btn-primary">Save</button>
              </div>
            </div>
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
              <th scope="col" className="px-6 py-4 font-medium flex justify-end ">{t('settingsPage.users.tableHeaders.actions')}</th>
            </tr>
          </thead>
          <tbody className={`divide-y  border-t ${localStorage.getItem('darkMode')==='true'?'border-darkthemeitems divide-darkthemeitems':'border-gray-200'}`}>
            {users.map((user) => (
              <tr key={user.id} className={` cursor-pointer ${localStorage.getItem('darkMode')==='true'?'hover:bg-bgdarktheme':'hover:bg-gray-50'}`} >
                <td className="px-6 py-4 font-medium" onClick={() => openModal(user)}>{user.id}</td>
                <td className="px-6 py-4" onClick={() => openModal(user)}>{user.first_name} {user.last_name}</td>
                {/* <td className="px-6 py-4">{user.phone}</td> */}
                <td className="px-6 py-4" onClick={() => openModal(user)}>{user.email}</td>
                <td className="px-6 py-4" onClick={() => openModal(user)}>{user.role ? user.role.name : 'no role affected'}</td>
                <td className="px-6 py-4 flex justify-end">
                  <button className="btn-secondary bg-softredtheme text-redtheme hover:bg-redtheme hover:text-white p-2 text-right " onClick={() => deleteUser(user.id)}><Trash size={15}/></button>
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