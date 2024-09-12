import { useState } from "react";
import AccessToClient from "../../components/clients/AccessToClient"
import SearchBar from "../../components/header/SearchBar"

const ClientsPage = () => {

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
      }
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
      }
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
      }
    },
  ]

  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  const showThis = (id: string) => {
    setSelectedClient(id);
  }

  const [searchResults, setSearchResults] = useState(clients);

  const searchFilter = (e: any) => { 
    const keyword = e.target.value;
    const results = clients.filter((client) => {
      return client.name.toLowerCase().includes(keyword.toLowerCase());
    });
    setSearchResults(results);
    console.log(results);
  }


  const [isProfile, setIsProfile] = useState(true);




  return (
    <div>
      <div>
        <h1>Clients</h1>
      </div>
      <div className="flex ">
        <div className="bg-white w-1/4  h-[calc(100vh-160px)]  flex flex-col gap-2 p-2 rounded-[10px]">
          <SearchBar SearchHandler={searchFilter}/>
          {/* <div className="flex gap-2">
            <button className="btn-primary">Confirmed</button>
            <button className="btn-primary">Pending</button>
            <button className="btn-primary">Canceled</button>
          </div> */}
          <select className="btn">
            <option >Filter by</option>
            <option>Pending</option>
            <option>Canceled</option>
          </select>
          <div className="flex flex-col gap-2 overflow-y-scroll overflow-x-auto h-full ">
          
          { searchResults.map((client) => (
            <AccessToClient key={client.id} onClick={() => showThis(client.id)} opacity={client.id === selectedClient ? '1' :''} image={client.image} name={client.name} />
          ))  
          }
          </div>
        </div>
        <div className="w-3/4">
          {selectedClient === null && <h1 className="text-center">Select a client to view</h1>}
          {selectedClient && 
            clients.filter(client => client.id === selectedClient).map((client, index) => (
              <div className="flex flex-col items-center" key={index}>
                <div className="text-center flex mb-2 items-center flex-col">
                  
                  <img className="w-[6em] h-[6em] overflow-hidden rounded-full object-cover" src={client.image} alt="client" />
                  <h1>{client.name}</h1>
                  <h4 className="text-subblack text-[18px]">{client.email}</h4>
                  <h4 className="text-subblack text-[18px]">{client.phoneNumber}</h4>
                </div>
                <div className="w-full p-3">
                  <h5 className="ml-2 text-subblack font-[600] text-[16px] mb-2" >Life time information</h5>
                  <div className="bg-white p-2 rounded-[10px] w-full flex justify-around">
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
                      <h4 className="font-[500] text-subblack">No show</h4>
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
                    <div className="flex text-subblack mt-2 font-[600] gap-2">
                      <button className={`hover:underline ${isProfile? 'text-greentheme':''}`} onClick={()=>{setIsProfile(true)}}>Profile</button>
                      <button className={`hover:underline ${isProfile? '':'text-greentheme'}`} onClick={()=>{setIsProfile(false)}}>Reservation History</button>
                    </div>
                    {isProfile && <div>
                        <h4 className="m-2 text-subblack">Informations</h4>
                        <div  className="bg-white p-2 rounded-[10px] w-full mt-2">
                          <table className="my-0">
                            <tr className="border-2">
                              <td className="font-[500] text-subblack">Name</td>
                              <td><input type="text" placeholder={client.name} /></td>
                              <td className="font-[500] border-l-2 text-subblack">Email</td>
                              <td><input type="text" placeholder={client.email} /></td>
                            </tr>
                            <tr className="border-2">
                              <td className="font-[500] text-subblack">Phone number</td>
                              <td><input type="text" placeholder={client.phoneNumber} /></td>
                              <td className="font-[500] border-l-2 text-subblack">Phone number</td>
                              <td><input type="text" placeholder={client.phoneNumber} /></td>
                            </tr>
                            <tr className="border-2">
                              <td className="font-[500] text-subblack">Organization</td>
                              <td colSpan={3}><input className="w-full" type="text" placeholder={client.phoneNumber} /></td>
                            </tr>
                            <tr className="border-2">
                              <td  className="font-[500] text-subblack">Guest Notes</td>
                              <td  colSpan={3}><input type="text" placeholder={client.phoneNumber} /></td>
                            </tr>
                          </table>
                        </div>
                      </div>
                      }
                  </div>
                </div>
              </div>
            ))

          }
        </div>
      </div>
    </div>
  )
}

export default ClientsPage
