import { useState } from "react";
import AccessToClient from "../../components/clients/AccessToClient"
import SearchBar from "../../components/header/SearchBar"
import { Outlet, useLocation, useParams } from "react-router-dom";

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

  
  const { pathname} = useLocation(); 




  return (
    <div>
      <div>
        <h1>Clients</h1>
      </div>
      <div className="flex ">
        <div className={`bg-white ${pathname === '/clients' ? 'w-full' : 'w-1/4 lt-sm:hidden'}  h-[calc(100vh-160px)]  flex flex-col gap-2 p-2 rounded-[10px] ${selectedClient? 'lt-sm:hidden':''}  `}>
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
            <AccessToClient key={client.id}  onClick={() => showThis(client.id)} image={client.image} name={client.name} id={client.id} />
          ))  
          }
          </div>
        </div>
        {pathname === '/clients' ? null: <Outlet />}
      </div>
    </div>
  )
}

export default ClientsPage
