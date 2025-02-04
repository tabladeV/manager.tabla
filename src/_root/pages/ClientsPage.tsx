import { useEffect, useState } from "react";
import AccessToClient from "../../components/clients/AccessToClient";
import SearchBar from "../../components/header/SearchBar";
import { Outlet, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BaseKey, BaseRecord, useList } from "@refinedev/core";
import { use } from "i18next";

import image from '../../assets/profile.png';

interface ClientData {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
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
}

const ClientsPage = () => {

  const {data , isLoading, error} = useList({
    resource: 'api/v1/bo/customers',
    meta: {
      headers: {
        'X-Restaurant-ID': 1,
      },
    },
  });


  const [clients, setClients] = useState<BaseRecord[]>([]);
  
  useEffect(() => {
    if (data?.data) {
      setClients(data.data);
    }
    
  }, [data]);
  
  console.log(data);
  const {t} = useTranslation();

  // const clients = [
  //   {
  //     id: 'janereq',
  //     name: 'Jane Smith',
  //     email: 'janeSmith@gmail.com',
  //     phoneNumber: '123456789',
  //     image: 'https://images.unsplash.com/photo-1526835746352-0b9da4054862?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  //     lifetime: {
  //       upcoming: 3,
  //       materialized: 1,
  //       denied: 20,
  //       cancelled: 4,
  //       noShow: 2,
  //       spendCover: 100.856,
  //       spendMAD: 521,
  //     },
  //   },
  //   {
  //     id: 'akans',
  //     name: 'Emily Nord',
  //     email: 'emilynord@gmail.com',
  //     phoneNumber: '123456789',
  //     image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  //     lifetime: {
  //       upcoming: 7,
  //       materialized: 6,
  //       denied: 10,
  //       cancelled: 29,
  //       noShow: 1,
  //       spendCover: 34.856,
  //       spendMAD: 300,
  //     },
  //   },
  //   {
  //     id: 'sasak',
  //     name: 'Jake Jackson',
  //     email: 'jakejack@gmail.com',
  //     phoneNumber: '123456789',
  //     image: 'https://images.unsplash.com/photo-1542727313-4f3e99aa2568?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  //     lifetime: {
  //       upcoming: 2,
  //       materialized: 5,
  //       denied: 5,
  //       cancelled: 66,
  //       noShow: 0,
  //       spendCover: 87.856,
  //       spendMAD: 745,
  //     },
  //   },
  // ];

  const [selectedClient, setSelectedClient] = useState<BaseRecord[]>([]);
  const [searchResults, setSearchResults] = useState(clients);

  useEffect(() => {
    setSearchResults(clients);
  }, [clients]);

  const searchFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keyword = e.target.value;
    if (keyword === '') {
      setSearchResults(clients);
    }
    else{
      const results = clients.filter((client) =>
        client.full_name.toLowerCase().includes(keyword.toLowerCase())
      );
      setSearchResults(results);
    }
  };

  const { pathname } = useLocation();

  const selectClient = (id: BaseKey |undefined ) => {
    setSelectedClient((prevSelectedClients) => {
      // Check if the client is already selected
      const isAlreadySelected = prevSelectedClients.some((client) => client.id === id);
  
      // If already selected, filter it out; otherwise, add the client to the selection
      if (isAlreadySelected) {
        return prevSelectedClients.filter((client) => client.id !== id);
      } else {
        const client = clients.find((client) => client.id === id);
        return client ? [...prevSelectedClients, client] : prevSelectedClients;
      }
    });
  };

  const selectAll = () => {
    setSelectedClient(searchResults);
  };
  
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  useEffect(() => {
    console.log(selectedClient);
  }, [selectedClient]);

  return (
    <div className="h-full">
      {showNotificationModal && (
        <div>
          <div className="overlay" onClick={()=>{setShowNotificationModal(false)}}></div>
          <div className={`sidepopup h-full lt-sm:w-full lt-sm:h-[70vh] lt-sm:bottom-0 ${localStorage.getItem('darkMode')==='true'?'bg-bgdarktheme':'bg-white'}`}>
            <h2 className="mb-5">Send a notification</h2>
            <form className="flex flex-col gap-2">
              <input type="text" placeholder="Subject" className={`inputs-unique ${localStorage.getItem('darkMode')==='true'?'bg-bgdarktheme2':'bg-white'}`} />
              <input type="text" placeholder="Offer" className={`inputs-unique ${localStorage.getItem('darkMode')==='true'?'bg-bgdarktheme2':'bg-white'}`} />
              <textarea
                placeholder="Type your message here"
                className={`inputs-unique h-[10em] sm:h-[20em] ${localStorage.getItem('darkMode')==='true'?'bg-bgdarktheme2 focus:border-none':'bg-white'}`} 
              ></textarea>
              <button className="btn-primary" type="submit">Send</button>
            </form>
          </div>
        </div>
      )}
      <div>
        <h1>{t('clients.title')}</h1>
      </div>
      <div className="flex gap-2">
        <div
          className={`${localStorage.getItem('darkMode')==='true'?'bg-bgdarktheme':'bg-white'} ${
            pathname === "/clients" || pathname === "/clients/" ? "" : "lt-sm:hidden"
          } sm:w-1/4 w-full h-[calc(100vh-160px)] flex flex-col gap-2 p-2 rounded-[10px]`}
        >
          <SearchBar SearchHandler={searchFilter} />
          {/* <select className="btn">
            <option>Filter by</option>
            <option>Pending</option>
            <option>Canceled</option>
          </select> */}
          {!(selectedClient.length === clients.length) ? (
            <button className={`btn-secondary hover:bg-softgreentheme hover:text-greentheme ${selectedClient === clients ? 'hidden':''}`} onClick={selectAll}>{t('clients.buttons.selectAll')}</button>
          ) : (
            <button className={`btn ${localStorage.getItem('darkMode')==='true'?'text-white':''} ${selectedClient === clients ? 'hidden':''}`} onClick={() => setSelectedClient([])}>{t('clients.buttons.deselectAll')}</button>
          )  
          }

          <div className="flex flex-col gap-2 overflow-y-scroll overflow-x-auto h-full lt-sm:h-[26em]">
            {searchResults.map((client) => (
              <AccessToClient
                key={client.id}
                onClick={() => selectClient(client.id)}
                image={image}
                checked={selectedClient.some((selected) => selected.id === client.id)}
                name={client.full_name}
                id={client.id}
              />
            ))}
          </div>
          <button className={` ${selectedClient.length === 0 ?  localStorage.getItem('darkMode')==='true'?'btn hover:border-[0px] border-[0px] cursor-not-allowed bg-subblack text-softwhitetheme ':'btn hover:border-[0px] border-[0px] cursor-not-allowed bg-softgreytheme ':'btn-primary'}`} disabled={selectedClient.length===0} onClick={()=>{(setShowNotificationModal(true))}}>{t('clients.sendNotificationButton')}</button>
        </div>
        {pathname === "/clients" || pathname === "/clients/" ? (
          <div className={`lt-sm:hidden flex flex-col items-center w-3/4 text-center p-2 rounded-[10px]`}>
            <h2>{t('clients.selectClient')}</h2>
          </div>
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  );
};

export default ClientsPage;
