import { useCallback, useEffect, useRef, useState } from "react";
import AccessToClient from "../../components/clients/AccessToClient";
import SearchBar from "../../components/header/SearchBar";
import { Outlet, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BaseKey, BaseRecord, useCreate, useList } from "@refinedev/core";
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

  const [pageSize,setPageSize ] =useState(3);
  const [page, setPage] = useState(1);

  interface ClientsType {
    
    results: BaseRecord[]
    count: number
    
  }

  const [clientsAPIInfo, setClientsAPIInfo] =useState<ClientsType>()

  const [templates, setTemplates] = useState<BaseRecord[]>();

  const {data: templateData, isLoading: templateIsLoading, error: templateError} = useList({
    resource: 'api/v1/bo/notifications/templates/',
    queryOptions:{
      onSuccess(data){
        setTemplates(data.data as unknown as BaseRecord[])
      }
    }
  });



  const {data , isLoading, error} = useList({
    resource: 'api/v1/bo/customers/',
    filters: [
      {
        field: "page",
        operator: "eq",
        value: page,
      },
      {
        field: "page_size",
        operator: "eq",
        value: pageSize,
      },
    ],
    queryOptions:{
      onSuccess(data){
        setClientsAPIInfo(data.data as unknown as ClientsType)
      }
    }

  });


  const {mutate: sendNotification} = useCreate(
    {
      resource: 'api/v1/bo/notifications/',
      mutationOptions:{
        onSuccess: (data) => {
          console.log('Notification sent:', data);
        },
        onError: (error) => {
          console.log('Error in sending notification:', error.message);
        },
      },
    }
  )

  const [clients, setClients] = useState<BaseRecord[]>([]);
  

  const [visibleClients, setVisibleClients] = useState(clients);
  const observerRef = useRef(null);

  useEffect(() => {
    if (clientsAPIInfo) {
      setClients(clientsAPIInfo.results as BaseRecord[]);
    }
    
  }, [clientsAPIInfo]);
  
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

  
  
  // Pagination

  // Load More Function
  const loadMore = useCallback(() => {
    setPageSize((prevPageSize) => prevPageSize + 4);
  }, []);

  // Intersection Observer to detect when the trigger is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore]);

  const [searchTemplate, setSearchTemplate] = useState(false);

  const [templateSearch, setTemplateSearch] = useState('');

  interface NotificationType {
    clients: BaseRecord[];
    template: number | undefined;
    restaurant: number | null;
    subject: string;
    message: string;
  }

  const [notificationInfo, setNotificationInfo] = useState<NotificationType>({
    clients: [],
    template: undefined,
    restaurant: null,
    subject: '',
    message: '',
  });

  

  const sendNotificationHandler = () => {
    console.log(selectedClient.map(client => client.id),'CLIENTS');
    sendNotification({
      values: {
      customers: selectedClient.map(client => client.id),
      template: notificationInfo.template,
      restaurant: Number(localStorage.getItem('restaurant_id')),
      subject: notificationInfo.subject,
      message: notificationInfo.message,
      },
    });
  }


  return (
    <div className="h-full">
      {showNotificationModal && (
        <div>
          <div className="overlay" onClick={()=>{setShowNotificationModal(false)}}></div>
          <div className={`sidepopup h-full lt-sm:w-full overflow-y-auto lt-sm:h-[70vh] lt-sm:bottom-0 ${localStorage.getItem('darkMode')==='true'?'bg-bgdarktheme':'bg-white'}`}>
            <h2 className="">Send a notification</h2>
            <div className="flex flex-col  gap-2">
              <div className="p-2 rounded-[10px] cursor-default">
                <p className="text-greentheme font-[600] mb-2">Send to</p>
                <div className="flex gap-2 flex-wrap">
                  {selectedClient.slice(0,4).map((client)=>(
                  <div key={client.id} className={`flex items-center gap-2 ${localStorage.getItem('darkMode')==='true'?'text-white':''}`}>
                    <p className={`text-sm btn ${localStorage.getItem('darkMode')==='true'?'text-white':''}`}>
                      {client.full_name}
                    </p>
                  </div>
                ))}
                {selectedClient.length>4 && <p className={`text-sm btn ${localStorage.getItem('darkMode')==='true'?'text-white':''}`}>and {selectedClient.length-4} more</p>}
                </div>
              </div>
              <input type="text" placeholder="Template"  className={`inputs-unique ${localStorage.getItem('darkMode')==='true'?'bg-bgdarktheme2':'bg-white'}`} onChange={(e)=>{setSearchTemplate(true);setTemplateSearch(e.target.value)}} value={templateSearch} onFocus={()=>{setSearchTemplate(true)}}/>
              {searchTemplate && 
                <div className={`flex max-h-[25vh] overflow-y-auto  flex-col gap-2 p-4 rounded-[10px] ${localStorage.getItem('darkMode')==='true'?'bg-bgdarktheme2':'bg-white'}`}>
                  {templates?.filter((template)=>template.name.toLowerCase().includes(templateSearch.toLowerCase())).map((template)=>(
                    <div
                    key={template.id}
                    className={`flex flex-col  btn cursor-pointer ${
                        localStorage.getItem('darkMode') === 'true' ? 'text-white bg-darkthemeitems' : 'bg-white'
                        }`}
                    onClick={() => {setTemplateSearch(template.name);setSearchTemplate(false);setNotificationInfo((prevNotificationInfo) => { return {...prevNotificationInfo, template: Number(template.id)}})}}
                >

                  <p>{template.name}</p>
                </div>
                  ))}
                </div>

              }
              
              <input type="text" placeholder="Subject" className={`inputs-unique ${localStorage.getItem('darkMode')==='true'?'bg-bgdarktheme2':'bg-white'}`} onChange={(e) => {setNotificationInfo((prevNotificationInfo) => { return {...prevNotificationInfo, subject: e.target.value}})}}/>
              <textarea
                placeholder="Type your message here"
                rows={5}
                onChange={(e) => {setNotificationInfo((prevNotificationInfo) => { return {...prevNotificationInfo, message: e.target.value}})}}
                className={`inputs-unique  ${localStorage.getItem('darkMode')==='true'?'bg-bgdarktheme2 focus:border-none':'bg-white'}`} 
              ></textarea>
              <button 
                className="btn-primary" 
                onClick={sendNotificationHandler}
              >
                Send
              </button>
            </div>
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
            <button className={`btn ${localStorage.getItem('darkMode')==='true'?'text-white':''} ${selectedClient !== clients ? 'hidden':''}`} onClick={() => setSelectedClient([])}>{t('clients.buttons.deselectAll')}</button>
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
            <div ref={observerRef} className="h-10 bg-transparent" />

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
