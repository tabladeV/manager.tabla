import AccessToClient from "../../components/clients/AccessToClient"
import SearchBar from "../../components/header/SearchBar"

const ClientsPage = () => {

  const clients =[
    {name: 'Jane Smith',image: 'https://images.unsplash.com/photo-1542727313-4f3e99aa2568?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'},
    {name: 'Jane Smith',image: 'https://images.unsplash.com/photo-1542727313-4f3e99aa2568?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'},
    {name: 'Jane Smith',image: 'https://images.unsplash.com/photo-1542727313-4f3e99aa2568?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'},
  ]

  return (
    <div>
      <div>
        <h1>Clients</h1>
      </div>
      <div className="flex ">
        <div className="bg-white flex flex-col gap-2 p-2 rounded-[10px]">
          <SearchBar />
          <div className="flex gap-2">
            <button className="btn-primary">Confirmed</button>
            <button className="btn-primary">Pending</button>
            <button className="btn-primary">Canceled</button>
          </div>
          <div className="flex flex-col gap-2">
          {clients.map((client, index) => (
            <AccessToClient  image={client.image} name={client.name} />
          )) 
          }
          </div>
        </div>
        <div className="w-3/4">

        </div>
      </div>
    </div>
  )
}

export default ClientsPage
