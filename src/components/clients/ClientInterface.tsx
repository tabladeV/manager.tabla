import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';


interface ClientData {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  alternatePhone?: string; // Optional property
  image: string;
  lifetime: {
    upcoming: number;
    materialized: number;
    denied: number;
    cancelled: number;
    noShow: number;
    spendCover: number;
    spendMAD: number;
  };
  organization: string;
  notes: string;
}

const ClientInterface = () => {
    const { id } = useParams();
    const [isProfile, setIsProfile] = useState(true);

    const clients =[
        {
          id: 'janereq',
          name: 'Jane Smith',
          email: 'janeSmith@gmail.com',
          phoneNumber: '123456789',
          image: 'https://images.unsplash.com/photo-1526835746352-0b9da4054862?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          lifetime: {
            upcoming: 3,
            materialized: 1,
            denied: 20,
            cancelled: 4,
            noShow: 2,
            spendCover: 100.856,
            spendMAD: 521
          },
          organization: 'Organization',
          notes: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, purus nec tincidunt luctus, justo nunc facilisis purus, nec cursus purus nunc nec erat. Nullam auctor, purus nec tincidunt luctus, justo nunc facilisis purus, nec cursus purus nunc nec erat. Nullam auctor, purus nec tincidunt luctus, justo nunc facilisis purus, nec cursus purus nunc nec erat.'
        },
        {
          id: 'akans',
          name: 'Emily Nord',
          email: 'emilynord@gmail.com',
          phoneNumber: '123456789',
          image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          lifetime: {
            upcoming: 7,
            materialized: 6,
            denied: 10,
            cancelled: 29,
            noShow: 1,
            spendCover: 34.856,
            spendMAD: 300
          },
          organization: 'Organization',
          notes: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, purus nec tincidunt luctus, justo nunc facilisis purus, nec cursus purus nunc nec erat. Nullam auctor, purus nec tincidunt luctus, justo nunc facilisis purus, nec cursus purus nunc nec erat. Nullam auctor, purus nec tincidunt luctus, justo nunc facilisis purus, nec cursus purus nunc nec erat.'
        },
        {
          id: 'sasak',
          name: 'jake Jackson',
          email: 'jakejack@gmail.com',
          phoneNumber: '123456789',
          image: 'https://images.unsplash.com/photo-1542727313-4f3e99aa2568?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          lifetime: {
            upcoming: 2,
            materialized: 5,
            denied: 5,
            cancelled: 66,
            noShow: 0,
            spendCover: 87.856,
            spendMAD: 745
          },
          organization: 'Organization',
          notes: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, purus nec tincidunt luctus, justo nunc facilisis purus, nec cursus purus nunc nec erat. Nullam auctor, purus nec tincidunt luctus, justo nunc facilisis purus, nec cursus purus nunc nec erat. Nullam auctor, purus nec tincidunt luctus, justo nunc facilisis purus, nec cursus purus nunc nec erat.'
        },
      ]


      console.log(clients.filter((client) => client.id === id)[0])

      const [client, setClient] = useState<ClientData>(clients.filter((client) => client.id === id)[0])
      useEffect(() => {
        setClient(clients.filter((client) => client.id === id)[0])
      }, [id, clients])
  const [editingField, setEditingField] = useState<keyof ClientData | null>(null)

  const handleEdit = (field: keyof ClientData) => {
    setEditingField(field)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setClient(prev => ({ ...prev, [name]: value }))
  }

  const handleBlur = () => {
    setEditingField(null)
  }

  const renderCell = (field: keyof ClientData, colspan?: number) => {
    const isEditing = editingField === field
    return (
      <td className="p-2" colSpan={colspan}>
        {isEditing ? (
          field === 'notes' ? (
            <textarea
              name={field}
              value={typeof client[field] === 'object' ? JSON.stringify(client[field]) : client[field]}
              onChange={handleChange}
              onBlur={handleBlur}
              className="inputs w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          ) : (
            <input
              type="text"
              name={field}
              value={typeof client[field] === 'object' ? JSON.stringify(client[field]) : client[field]}
              onChange={handleChange}
              onBlur={handleBlur}
              className="inputs-unique w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )
        ) : (
          <span
            onClick={() => handleEdit(field)}
            className="block w-full px-3 py-2 bg-gray-100 rounded cursor-pointer hover:bg-gray-200 transition-colors"
          >
            {typeof client[field] === 'object' ? JSON.stringify(client[field]) : client[field] || 'Click to edit'}
          </span>
        )}
      </td>
    )
  }

  return (
    <div className='overflow-y-scroll w-3/4 lt-sm:w-full'>
        {clients.filter((client) => client.id === id).map((client) => {
            return (
                <div className=''>
          
           
              <div className="flex flex-col items-center" >
                <div className="text-center flex mb-2 items-center flex-col">
                  
                  <img className="w-[6em] h-[6em] overflow-hidden rounded-full object-cover" src={client.image} alt="client" />
                  <h1>{client.name}</h1>
                  <h4 className="text-subblack text-[18px]">{client.email}</h4>
                  <h4 className="text-subblack text-[18px]">{client.phoneNumber}</h4>
                </div>
                <div className="w-full p-3 gap-3">
                  <h5 className="ml-2 text-subblack font-[600] text-[16px] mb-2" >Life time information</h5>
                  <div className="bg-white p-2 rounded-[10px] gap-3 w-full flex lt-sm:flex-wrap justify-around">
                    <div className="flex flex-col items-center">
                      <h1>{client.lifetime.upcoming}</h1>
                      <h4 className="font-[500] text-subblack">Upcoming</h4>
                    </div>

                    <div className="flex flex-col items-center">
                      <h1>{client.lifetime.materialized}</h1>
                      <h4 className="font-[500] text-subblack">Materialized</h4>
                    </div>

                    <div className="flex flex-col items-center">
                      <h1>{client.lifetime.denied}</h1>
                      <h4 className="font-[500] text-subblack">Denied</h4>
                    </div>

                    <div className="flex flex-col items-center">
                      <h1>{client.lifetime.cancelled}</h1>
                      <h4 className="font-[500] text-subblack">Cancelled</h4>
                    </div>

                    <div className="flex flex-col items-center">
                      <h1>{client.lifetime.noShow}</h1>
                      <h4 className="font-[500] text-subblack">Didn't show</h4>
                    </div>

                    <div className="flex flex-col items-center">
                      <h1>{client.lifetime.spendCover}</h1>
                      <h4 className="font-[500] text-subblack">Spend/cover</h4>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <h1>{client.lifetime.spendMAD}</h1>
                      <h4 className="font-[500] text-subblack">Spend MAD</h4>
                    </div>

                  </div>
                  <div>
                    <div className="flex text-subblack mt-2 font-[600] justify-evenly gap-2">
                      <button className={`hover:underline w-full ${isProfile? 'text-greentheme':''}`} onClick={()=>{setIsProfile(true)}}>Profile</button>
                      <div className="border-r-2"></div>
                      <button className={`hover:underline w-full ${isProfile? '':'text-greentheme'}`} onClick={()=>{setIsProfile(false)}}>Reservation History</button>
                    </div>
                    {isProfile && <div>
                        <h4 className="m-2 text-subblack">Informations</h4>
                        <div  className=" px-2 py-1 rounded-[10px] mt-2">
                        <table className="w-full bg-white border-collapse">
                          <tbody>
                            <tr className="border border-gray-300">
                              <td className="font-medium text-gray-700 p-2 w-1/4">Name</td>
                              {renderCell('name')}
                              <td className="font-medium text-gray-700 p-2 w-1/4 border-l border-gray-300">Email</td>
                              {renderCell('email')}
                            </tr>
                            <tr className="border border-gray-300">
                              <td className="font-medium text-gray-700 p-2">Phone number</td>
                              {renderCell('phoneNumber')}
                              <td className="font-medium text-gray-700 p-2 border-l border-gray-300">Alternate phone</td>
                              {renderCell('alternatePhone')}
                            </tr>
                            <tr className="border border-gray-300">
                              <td className="font-medium text-gray-700 p-2">Organization</td>
                              {renderCell('organization', 3)}
                            </tr>
                            <tr className="border border-gray-300">
                              <td className="font-medium text-gray-700 p-2">Guest Notes</td>
                              {renderCell('notes', 3)}
                            </tr>
                          </tbody>
                        </table>
                        </div>
                      </div>
                      }
                  </div>
                </div>
              </div>

        
        </div>
            )
        })}
        
    </div>
  )
}

export default ClientInterface
