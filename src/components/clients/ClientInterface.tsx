import { BaseKey, BaseRecord, useDelete, useList, useUpdate } from '@refinedev/core';
import { da } from 'date-fns/locale';
import i18next from 'i18next';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import image from '../../assets/profile.png';
import { Trash } from 'lucide-react';

interface ClientData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
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
  internal_note: string;
}

// interface Reservation extends BaseRecord {
//   id: BaseKey;
//   email: string;
//   full_name: string;
//   date: string;
//   time: string;
//   source: string;
//   number_of_guests: string;
//   status: string;
//   comment?: string;
//   review?: boolean;
//   floor_name?: string;
//   tables?: string;
// }

const ClientInterface = () => {
  const { id } = useParams();
  const navigate = useNavigate();


  const {mutate : deleteClientMutation} = useDelete();

  const {data , isLoading, error} = useList({
    resource: 'api/v1/bo/customers/'+id+'/',

  });

  const {data: reservations, isLoading: isLoadingReservations, error: errorReservations} = useList({
    resource: `api/v1/bo/reservations/${id}/`,

  });
  console.log(data)

  const {data: userReservations , isLoading: reservationLoading, error: reservationError}= useList({
    resource: `api/v1/bo/customers/${id}/reservations/`,

  })

  const {mutate: updateClient} = useUpdate();


  const [reservation, setReservation] = useState<BaseRecord[]>([]);

  const [client, setClient] = useState<BaseRecord | null>(null);

  useEffect(() => {
    if (data?.data) {
      setClient(data.data);
    }
    if (userReservations?.data) {
      setReservation(userReservations.data);
    }
  }, [data, reservations]);

  console.log(reservation,'new')




  const [isProfile, setIsProfile] = useState(true);

  const { t } = useTranslation();

  
  
  interface Reservation{
    id: number,
    occasion: string,
    status: string,
    source: string,
    commenter: string,
    internal_note: string,
    number_of_guests: number,
    date: string,
    time: string,
    review_link: string,
    created_at: string,
    edit_at: string,
    user: null,
    restaurant: number,
    customer: number,
    offer: null
  }
  
  const [reservationHistory,setReservationHistory] = useState<Reservation[]>();

  useEffect(()=>{
    if(reservation){
      setReservationHistory(reservation as Reservation[])
    }
  },[reservation])

  const reservationOrigin = (origin: string) => {
    if (origin === 'MARKETPLACE') {
      return (
        <div className={`flex p-1 rounded-md flex-col items-center ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems text-whitetheme':'bg-softgreytheme text-subblack'}`}>
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 7.5H5.5M5.5 7.5V6M5.5 7.5H8M8 7.5V6M8 7.5H10.5M10.5 7.5V6M10.5 7.5H13M6.5 9.5H7.5M8.5 9.5H9.5M8.5 11H9.5M6.5 11H7.5M3.5 13.5V7.5H2.5V5.5L4 2.5H12L13.5 5.5V7.5H12.5V13.5H3.5Z" stroke={localStorage.getItem('darkMode')==='true'?'#fff':'#1e1e1e90'} strokeWidth='1.4' strokeLinejoin="round"/>
          </svg>
        </div>
      )
    }
    if (origin === 'WEBSITE') {
      return (
        <div className={`flex p-1 rounded-md  items-center ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems text-whitetheme':'bg-softgreytheme text-subblack'}`}>
          <svg className="" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.36 14C16.44 13.34 16.5 12.68 16.5 12C16.5 11.32 16.44 10.66 16.36 10H19.74C19.9 10.64 20 11.31 20 12C20 12.69 19.9 13.36 19.74 14M14.59 19.56C15.19 18.45 15.65 17.25 15.97 16H18.92C17.9512 17.6683 16.4141 18.932 14.59 19.56ZM14.34 14H9.66C9.56 13.34 9.5 12.68 9.5 12C9.5 11.32 9.56 10.65 9.66 10H14.34C14.43 10.65 14.5 11.32 14.5 12C14.5 12.68 14.43 13.34 14.34 14ZM12 19.96C11.17 18.76 10.5 17.43 10.09 16H13.91C13.5 17.43 12.83 18.76 12 19.96ZM8 8H5.08C6.03864 6.32703 7.57466 5.06124 9.4 4.44C8.8 5.55 8.35 6.75 8 8ZM5.08 16H8C8.35 17.25 8.8 18.45 9.4 19.56C7.57827 18.9323 6.04429 17.6682 5.08 16ZM4.26 14C4.1 13.36 4 12.69 4 12C4 11.31 4.1 10.64 4.26 10H7.64C7.56 10.66 7.5 11.32 7.5 12C7.5 12.68 7.56 13.34 7.64 14M12 4.03C12.83 5.23 13.5 6.57 13.91 8H10.09C10.5 6.57 11.17 5.23 12 4.03ZM18.92 8H15.97C15.6565 6.76161 15.1931 5.56611 14.59 4.44C16.43 5.07 17.96 6.34 18.92 8ZM12 2C6.47 2 2 6.5 2 12C2 14.6522 3.05357 17.1957 4.92893 19.0711C5.85752 19.9997 6.95991 20.7362 8.17317 21.2388C9.38642 21.7413 10.6868 22 12 22C14.6522 22 17.1957 20.9464 19.0711 19.0711C20.9464 17.1957 22 14.6522 22 12C22 10.6868 21.7413 9.38642 21.2388 8.17317C20.7362 6.95991 19.9997 5.85752 19.0711 4.92893C18.1425 4.00035 17.0401 3.26375 15.8268 2.7612C14.6136 2.25866 13.3132 2 12 2Z" fill={localStorage.getItem('darkMode')==='true'?'#fff':'#1e1e1e90'}/>
          </svg>
        </div>
      )
    }
    if (origin === 'BACK_OFFICE') {
      return (
        <div className={`flex p-1 rounded-md  items-center ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems text-whitetheme':'bg-softgreytheme text-subblack'}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M2.879 3.879C2 4.757 2 6.172 2 9V15C2 17.828 2 19.243 2.879 20.121C3.757 21 5.172 21 8 21H16C18.828 21 20.243 21 21.121 20.121C22 19.243 22 17.828 22 15V9C22 6.172 22 4.757 21.121 3.879C20.243 3 18.828 3 16 3H8C5.172 3 3.757 3 2.879 3.879ZM16 8C16.2652 8 16.5196 8.10536 16.7071 8.29289C16.8946 8.48043 17 8.73478 17 9V17C17 17.2652 16.8946 17.5196 16.7071 17.7071C16.5196 17.8946 16.2652 18 16 18C15.7348 18 15.4804 17.8946 15.2929 17.7071C15.1054 17.5196 15 17.2652 15 17V9C15 8.73478 15.1054 8.48043 15.2929 8.29289C15.4804 8.10536 15.7348 8 16 8ZM9 11C9 10.7348 8.89464 10.4804 8.70711 10.2929C8.51957 10.1054 8.26522 10 8 10C7.73478 10 7.48043 10.1054 7.29289 10.2929C7.10536 10.4804 7 10.7348 7 11V17C7 17.2652 7.10536 17.5196 7.29289 17.7071C7.48043 17.8946 7.73478 18 8 18C8.26522 18 8.51957 17.8946 8.70711 17.7071C8.89464 17.5196 9 17.2652 9 17V11ZM13 13C13 12.7348 12.8946 12.4804 12.7071 12.2929C12.5196 12.1054 12.2652 12 12 12C11.7348 12 11.4804 12.1054 11.2929 12.2929C11.1054 12.4804 11 12.7348 11 13V17C11 17.2652 11.1054 17.5196 11.2929 17.7071C11.4804 17.8946 11.7348 18 12 18C12.2652 18 12.5196 17.8946 12.7071 17.7071C12.8946 17.5196 13 17.2652 13 17V13Z"  fill={localStorage.getItem('darkMode')==='true'?'#fff':'#1e1e1e90'}/>
          </svg>
        </div>
      )
    }
    if (origin === 'WIDGET') {
      return (
        <div className={`flex p-1 rounded-md  items-center ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems text-whitetheme':'bg-softgreytheme text-subblack'}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path opacity="0.5" d="M2 6.5C2 4.379 2 3.318 2.659 2.659C3.318 2 4.379 2 6.5 2C8.621 2 9.682 2 10.341 2.659C11 3.318 11 4.379 11 6.5C11 8.621 11 9.682 10.341 10.341C9.682 11 8.621 11 6.5 11C4.379 11 3.318 11 2.659 10.341C2 9.682 2 8.621 2 6.5ZM13 17.5C13 15.379 13 14.318 13.659 13.659C14.318 13 15.379 13 17.5 13C19.621 13 20.682 13 21.341 13.659C22 14.318 22 15.379 22 17.5C22 19.621 22 20.682 21.341 21.341C20.682 22 19.621 22 17.5 22C15.379 22 14.318 22 13.659 21.341C13 20.682 13 19.621 13 17.5Z" fill="black"/>
            <path d="M2 17.5C2 15.379 2 14.318 2.659 13.659C3.318 13 4.379 13 6.5 13C8.621 13 9.682 13 10.341 13.659C11 14.318 11 15.379 11 17.5C11 19.621 11 20.682 10.341 21.341C9.682 22 8.621 22 6.5 22C4.379 22 3.318 22 2.659 21.341C2 20.682 2 19.621 2 17.5ZM13 6.5C13 4.379 13 3.318 13.659 2.659C14.318 2 15.379 2 17.5 2C19.621 2 20.682 2 21.341 2.659C22 3.318 22 4.379 22 6.5C22 8.621 22 9.682 21.341 10.341C20.682 11 19.621 11 17.5 11C15.379 11 14.318 11 13.659 10.341C13 9.682 13 8.621 13 6.5Z" fill="black"/>
          </svg>
        </div>
      )
    }
    return (
      <div>
        <h4 className={` text-[14px] font-[500] p-1 rounded-md ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems text-whitetheme':'bg-softgreytheme text-subblack'}`}>{origin}</h4>
      </div>
    )
  }

  const [editingField, setEditingField] = useState<keyof ClientData | null>(null);

  // useEffect(() => {
  //   const selectedClient = clients.find((client) => client.id === id) || null;
  //   setClient(selectedClient);
  // }, [id]);

  const handleEdit = (field: keyof ClientData) => {
    setEditingField(field);
  };

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setClient((prev) =>
      prev ? { ...prev, [name]: value } : null
    );
    const textarea = textareaRef.current;
    if (textarea instanceof HTMLTextAreaElement) {
      // Reset height to auto to recalculate
      textarea.style.height = "auto";
      // Set height to scrollHeight (content height)
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
    updateClient({
      resource: 'api/v1/bo/customers',
      values: {
        [name]: value,
      },
      id: id+'/',

    });
  };

  const handleBlur = () => {
    setEditingField(null);
  };

  const deleteClient = () => {
    deleteClientMutation(
      {
          resource: `api/v1/bo/customers`, 
          id: id+'/',
          meta: {
              headers: {
                  "X-Restaurant-ID": 1,
              },
          },
      },
      {
          onSuccess: () => {
              
              navigate('/clients');
          },
          onError: (error) => {
              console.error("Error deleting the client:", error);
              alert("Failed to delete the client. Please try again.");
          },
      }
    );
  }

  const renderCell = (field: keyof ClientData, colspan?: number) => {
    const isEditing = editingField === field;
    return (
      <td className="p-2" colSpan={colspan}>
        {isEditing ? (
          field === 'internal_note' ? (
            <textarea
              name={field}
              ref={textareaRef}
              value={(client && typeof client[field] === 'string') ? client[field] : ''}
              onChange={handleChange}
              rows={1}
              onBlur={handleBlur}
              className={`inputs no-scrollbar w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${localStorage.getItem('darkMode')==='true'?'bg-bgdarktheme2':'bg-white'}`}
            />
          ) : (
            <input
              type="text"
              name={field}
              value={(client && typeof client[field] === 'string') ? client[field] : ''}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`inputs-unique w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${localStorage.getItem('darkMode')==='true'?'bg-bgdarktheme2':'bg-white'}`}
            />
          )
        ) : (
          <span
            onClick={() => handleEdit(field)}
            className={`block w-full px-3 py-2  rounded cursor-pointer  transition-colors ${localStorage.getItem('darkMode')==='true'?'bg-bgdarktheme hover:bg-bgdarktheme2':'bg-gray-100 hover:bg-gray-200'}`}
          >
            {(client && typeof client[field] === 'string') ? client[field] : 'Click to edit'}
          </span>
        )}
      </td>
    );
  };

  return (
    <div className="overflow-y-scroll h-[calc(100vh-160px)] w-3/4 lt-sm:w-full">
      {client && (
        <div className="">
          <div className="flex flex-col items-center">
            <div className="text-center flex mb-2 items-center flex-col">
              <img
                className="w-[6em] h-[6em] overflow-hidden rounded-full object-cover"
                src={image}
                alt="client"
              />
              <h1>{client.full_name}</h1>
              <h4 className={` text-[18px] font-[500] ${localStorage.getItem('darkMode')==='true'?'text-softwhitetheme':'text-subblack'}`}>{client.email}</h4>
              <h4 className={` text-[18px] font-[500] ${localStorage.getItem('darkMode')==='true'?'text-softwhitetheme':'text-subblack'}`}>{client.phone}</h4>
              <button onClick={deleteClient} className='btn-primary mt-2 bg-softredtheme text-redtheme hover:bg-redtheme hover:text-white flex items-center gap-3'><Trash size={14}/> Delete client</button>
            </div>
            <div className={`w-full p-3 gap-3 ${localStorage.getItem('darkMode')==='true'?'text-[#e1e1e160 ]':' text-subblack '} rounded-[10px]`}>
              {/* <h5 className="ml-2  font-[600] text-[16px] mb-2">{t('clients.lifetimeInfo.title')}</h5>
              <div className={`p-2 rounded-[10px] gap-3 w-full flex lt-sm:flex-wrap justify-around ${localStorage.getItem('darkMode')==='true'?'bg-bgdarktheme':'bg-white text-bgdarktheme2'}`}>
                <div className="flex flex-col items-center">
                  <h1>{client.lifetime.upcoming}</h1>
                  <h4 className="font-[500] ">{t('clients.lifetimeInfo.upcoming')}</h4>
                </div>
                <div className="flex flex-col items-center">
                  <h1>{client.lifetime.materialized}</h1>
                  <h4 className="font-[500] ">{t('clients.lifetimeInfo.materialized')}</h4>
                </div>
                <div className="flex flex-col items-center">
                  <h1>{client.lifetime.denied}</h1>
                  <h4 className="font-[500] ">{t('clients.lifetimeInfo.denied')}</h4>
                </div>
                <div className="flex flex-col items-center">
                  <h1>{client.lifetime.cancelled}</h1>
                  <h4 className="font-[500] ">{t('clients.lifetimeInfo.cancelled')}</h4>
                </div>
                <div className="flex flex-col items-center">
                  <h1>{client.lifetime.noShow}</h1>
                  <h4 className="font-[500] ">{t('clients.lifetimeInfo.didntShow')}</h4>
                </div>
                <div className="flex flex-col items-center">
                  <h1>{client.lifetime.spendCover}</h1>
                  <h4 className="font-[500] ">{t('clients.lifetimeInfo.spendPerCover')}</h4>
                </div>
                <div className="flex flex-col items-center">
                  <h1>{client.lifetime.spendMAD}</h1>
                  <h4 className="font-[500] ">{t('clients.lifetimeInfo.spendMAD')}</h4>
                </div>
              </div> */}
              <div>
                <div className="flex text-subblack mt-2 font-[600] justify-evenly gap-2">
                  <button
                    className={` w-full ${isProfile ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setIsProfile(true)}
                  >
                    {t('clients.tabs.profile')}
                  </button>
                  <div className="border-r-2"></div>
                  <button
                    className={` w-full ${isProfile ? ' btn-secondary' : 'btn-primary'}`}
                    onClick={() => setIsProfile(false)}
                  >
                    {t('clients.tabs.reservationHistory')}
                  </button>
                </div>
                {isProfile ? (
                  <div>
                    <h4 className="m-2 text-greytheme font-[500]">{t('clients.profileSection.title')}</h4>
                    <div className="px-2 py-1 rounded-[10px] mt-2">
                      <table className="w-full  border-collapse">
                        <tbody>
                          <tr className="border border-gray-300">
                            <td className="font-medium p-2">{t('clients.profileSection.fields.firstName')}</td>
                            {renderCell('first_name')}
                          </tr>
                          <tr className="border border-gray-300">
                            <td className="font-medium p-2">{t('clients.profileSection.fields.lastName')}</td>
                            {renderCell('last_name', 3)}
                          </tr>
                          <tr className="border border-gray-300">
                            <td className="font-medium p-2 w-1/4 border-l border-gray-300 lt-sm:hidden">{t('clients.profileSection.fields.email')}</td>
                            {renderCell('email')}
                          </tr>
                          {/* <tr className='sm:hidden border border-gray-300'>
                            <td className="font-medium p-2 border-l border-gray-300">{t('clients.profileSection.fields.email')}</td>
                            {renderCell('email')}
                          </tr> */}
                          <tr className="border border-gray-300">
                            <td className="font-medium p-2">{t('clients.profileSection.fields.phoneNumber')}</td>
                            {renderCell('phone')}
                            {/* <td className="font-medium p-2 border-l border-gray-300 lt-sm:hidden">{t('clients.profileSection.fields.alternatePhone')}</td>
                            <span className='lt-sm:hidden'>{renderCell('alternatePhone')}</span> */}
                          </tr>
                          {/* <tr className='sm:hidden border border-gray-300'>
                            <td className="font-medium p-2 border-l border-gray-300">{t('clients.profileSection.fields.alternatePhone')}</td>
                            {renderCell('alternatePhone')}
                          </tr> */}
                          <tr className="border border-gray-300">
                            <td className="font-medium p-2">{t('clients.profileSection.fields.guestNotes')}</td>
                            {renderCell('internal_note', 3)}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                ):
                (
                  <div>
                    <h4 className="m-2 text-greytheme font-[500]">Reservation History</h4>
                    <div className="w-full  mx-auto  overflow-x-auto">
                      <table className={`w-full  border-collapse shadow-sm ${i18next.language === 'ar' && 'text-right'}`}>
                        <thead>
                          <tr className={`${localStorage.getItem('darkMode')==='true'?'bg-bgdarktheme text-gray-300':'bg-gray-50 text-gray-700'}`}>
                            <th className="font-semibold p-3 text-left border-b border-gray-200">{t('clients.reservationHistorySection.tableHeaders.date')}</th>
                            <th className="font-semibold p-3 text-left border-b border-gray-200">{t('clients.reservationHistorySection.tableHeaders.time')}</th>
                            <th className="font-semibold p-3 text-left border-b border-gray-200 flex justify-center">{t('clients.reservationHistorySection.tableHeaders.made')}</th>
                            <th className="font-semibold p-3 text-left border-b border-gray-200">{t('clients.reservationHistorySection.tableHeaders.comment')}</th>
                            <th className="font-semibold p-3 text-left border-b border-gray-200">{t('clients.reservationHistorySection.tableHeaders.guests')}</th>
                            <th className="font-semibold p-3 text-left border-b border-gray-200">{t('clients.reservationHistorySection.tableHeaders.status')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reservationHistory?.map((res, index) => (
                            <tr 
                              key={index} 
                              // className={`${ localStorage.getItem('darkMode')==='true'? (res.id % 2 === 0 ? 'bg-bgdarktheme2 border-b border-gray-800 hover:bg-black' : 'bg-bgdarktheme border-b hover:bg-black border-gray-800') :(reservation.id % 2 === 0 ? 'bg-white hover:bg-gray-100' : 'bg-gray-50 hover:bg-gray-100')}  transition-colors duration-150 ease-in-out`}
                            >
                              <td className="p-3 ">{res.date}</td>
                              <td className="p-3 ">{res.time}</td>
                              <td className="p-3  flex h-full itmes-center justify-center">
                                {reservationOrigin(res.source)}
                              </td>
                              <td className="p-3 ">{res.commenter}</td>
                              <td className="p-3 ">{res.number_of_guests}</td>
                              <td className="p-3 ">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  res.status === 'APPROVED' ? 'bg-softgreentheme text-greentheme' :
                                  res.status === 'CANCELED' ? 'bg-softredtheme text-redtheme' :
                                  res.status === 'SEATED' ? 'bg-softyellowtheme text-yellowtheme' :
                                  res.status === 'FULFILLED' ? 'bg-softpurpletheme text-purpletheme' :
                                  'bg-softbluetheme text-bluetheme'
                                }`}>
                                  {res.status === 'APPROVED' ? t('clients.reservationHistorySection.statusLabels.confirmed') : res.status === 'CANCELED' ? t('clients.reservationHistorySection.statusLabels.cancelled') : res.status === 'SEATED' ? t('clients.reservationHistorySection.statusLabels.seated') : res.status === 'FULFILLED' ? t('clients.reservationHistorySection.statusLabels.fulfilled') : t('clients.reservationHistorySection.statusLabels.pending')}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientInterface;
