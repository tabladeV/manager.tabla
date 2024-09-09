import { useState } from "react"
import SearchBar from "../../components/header/SearchBar"
import ClientCard from "../../components/payment/ClientCard"
import { stat } from "fs"


const PaymentPage = () => {

  const clients = [
    {id: "john1",name: 'John Doe', email: "jonny@gmail.com", phoneNumber: "+2126912113", time: '12:00', date: '12/12/2021', guests: 4, occasion: 'Birthday', status: 'Confirmed', floor: 'Terrace 1', tableNumber: 'T-1', image: 'https://images.unsplash.com/photo-1542458579-bc6f69b5ce6b?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'},
    {id: "jane2",name: 'Jane Doe', email: "Jane@gmail.com", phoneNumber: "+2126912113", time: '12:00', date: '12/12/2021', guests: 4, occasion: 'Birthday', status: 'Pending', floor: 'Terrace 1', tableNumber: 'T-2', image: 'https://images.unsplash.com/photo-1542727313-4f3e99aa2568?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'},
    {id: "Luke",name: 'Luke De Junge', email: "luke@gmail.com", phoneNumber: "+2126912113", time: '12:00', date: '12/12/2021', guests: 4, occasion: 'Birthday', status: 'Pending', floor: 'Terrace 1', tableNumber: 'T-3', image: 'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?q=80&w=1536&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'},
  ]

  const [selectedClient, setSelectedClient] = useState('');
  const showThis = (id: string) => {
    setSelectedClient(id);
  }

  const statusStyle = (status: string): string => {
    status = status.toLowerCase();

    if (status === 'confirmed') {
      return 'px-4 py-1 bg-softgreentheme rounded-[10px] text-greentheme font-bold mx-auto'
    } else if (status === 'pending') {
      return 'px-4 py-1 bg-softredtheme rounded-[10px] text-redtheme font-bold mx-auto'
    } else {
      return 'bg-yellow-500'
    }
  }
  return (
    <div>
      <div>
        <h1>
          Payment
        </h1>
      </div>
      <div className="flex ">
        <div className="bg-white max-h-[calc(100vh-160px)] rounded-[10px] p-2">
          <SearchBar />
          <div className="grid grid-flow-col w-full gap-2 my-2">
            <button className="btn-primary">Confirmed</button>
            <button className="btn-primary">Canceled</button>
            <button className="btn-primary">Pending</button>
          </div>
          {clients.map((client, index) => (
            <ClientCard itemData={client} opacity={client.id === selectedClient ? 1:.5} onClick={() => showThis(client.id)} key={index} />
          )) 
          }
        </div>
        <div className="w-3/4">
          {selectedClient && <div>
            {clients.filter(client => client.id === selectedClient).map((client, index) => (
              <div className="flex flex-col items-center" key={index}>
                <div className="text-center flex mb-2 items-center flex-col">
                  
                  <img className="w-[6em] h-[6em] overflow-hidden rounded-full object-cover" src={client.image} alt="client" />
                  <h1>{client.name}</h1>
                  <h4 className="text-subblack text-[18px]">{client.email}</h4>
                  <h4 className="text-subblack text-[18px]">{client.phoneNumber}</h4>
                </div>
                  <div className="bg-white w-2/3 flex flex-col gap-3 rounded-[20px] p-4 ">
                    <h3 className="text-center">Reservation Details</h3>
                    <div className="flex justify-between text-[17px] text-subblack font-[500]">
                      <div className="flex gap-2  items-center ">
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1.25 5.625C1.25 4.44625 1.25 3.8575 1.61625 3.49125C1.9825 3.125 2.57125 3.125 3.75 3.125H11.25C12.4288 3.125 13.0175 3.125 13.3837 3.49125C13.75 3.8575 13.75 4.44625 13.75 5.625C13.75 5.91937 13.75 6.06687 13.6588 6.15875C13.5669 6.25 13.4187 6.25 13.125 6.25H1.875C1.58062 6.25 1.43312 6.25 1.34125 6.15875C1.25 6.06687 1.25 5.91875 1.25 5.625ZM1.25 11.25C1.25 12.4288 1.25 13.0175 1.61625 13.3837C1.9825 13.75 2.57125 13.75 3.75 13.75H11.25C12.4288 13.75 13.0175 13.75 13.3837 13.3837C13.75 13.0175 13.75 12.4288 13.75 11.25V8.125C13.75 7.83063 13.75 7.68313 13.6588 7.59125C13.5669 7.5 13.4187 7.5 13.125 7.5H1.875C1.58062 7.5 1.43312 7.5 1.34125 7.59125C1.25 7.68313 1.25 7.83125 1.25 8.125V11.25Z" fill="#88AB61"/>
                          <path d="M4.375 1.875V3.75M10.625 1.875V3.75" stroke="#88AB61" stroke-width="2" stroke-linecap="round"/>
                        </svg>

                        <p>{client.date}</p>
                      </div>
                      <div className="flex gap-2  items-center ">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8.00016 14.6667C4.31816 14.6667 1.3335 11.682 1.3335 8C1.3335 4.318 4.31816 1.33333 8.00016 1.33333C11.6822 1.33333 14.6668 4.318 14.6668 8C14.6668 11.682 11.6822 14.6667 8.00016 14.6667ZM8.66683 8V4.66667H7.3335V9.33333H11.3335V8H8.66683Z" fill="#88AB61"/>
                        </svg>
                        <p>{client.time}</p>
                      </div>

                      <div className="flex gap-2  items-center ">
                        <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M14 14.875V16.625H1.75V14.875C1.75 14.875 1.75 11.375 7.875 11.375C14 11.375 14 14.875 14 14.875ZM10.9375 6.5625C10.9375 5.9568 10.7579 5.36469 10.4214 4.86107C10.0849 4.35744 9.60657 3.96491 9.04697 3.73312C8.48737 3.50133 7.8716 3.44068 7.27754 3.55885C6.68347 3.67701 6.13778 3.96869 5.70949 4.39699C5.28119 4.82529 4.98951 5.37097 4.87135 5.96504C4.75318 6.5591 4.81383 7.17487 5.04562 7.73447C5.27741 8.29407 5.66994 8.77237 6.17357 9.10888C6.67719 9.44539 7.26929 9.625 7.875 9.625C8.68723 9.625 9.46618 9.30235 10.0405 8.72802C10.6148 8.15369 10.9375 7.37473 10.9375 6.5625ZM13.9475 11.375C14.4854 11.7913 14.9256 12.3204 15.237 12.9251C15.5484 13.5298 15.7235 14.1953 15.75 14.875V16.625H19.25V14.875C19.25 14.875 19.25 11.6988 13.9475 11.375ZM13.125 3.5C12.5228 3.4972 11.9339 3.67722 11.4362 4.01625C11.9678 4.7589 12.2535 5.64925 12.2535 6.5625C12.2535 7.47575 11.9678 8.36611 11.4362 9.10875C11.9339 9.44779 12.5228 9.6278 13.125 9.625C13.9372 9.625 14.7162 9.30235 15.2905 8.72802C15.8648 8.15369 16.1875 7.37473 16.1875 6.5625C16.1875 5.75028 15.8648 4.97132 15.2905 4.39699C14.7162 3.82266 13.9372 3.5 13.125 3.5Z" fill="#88AB61"/>
                        </svg>
                        <p>{client.guests}</p>
                      </div>
                      <div className="flex gap-2  items-center ">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <g clip-path="url(#clip0_35_533)">
                          <path d="M9.45 1.65C9.32018 1.55263 9.16228 1.5 9 1.5C8.83772 1.5 8.67982 1.55263 8.55 1.65C8.23755 1.88938 7.94941 2.15893 7.68975 2.45475C7.2975 2.8965 6.75 3.64125 6.75 4.5C6.75 5.09674 6.98705 5.66903 7.40901 6.09099C7.83097 6.51295 8.40326 6.75 9 6.75H4.5C3.90326 6.75 3.33097 6.98705 2.90901 7.40901C2.48705 7.83097 2.25 8.40326 2.25 9V10.5C2.25 11.427 3.30825 11.9565 4.05 11.4L4.55025 11.025C4.68007 10.9276 4.83797 10.875 5.00025 10.875C5.16253 10.875 5.32043 10.9276 5.45025 11.025L5.64975 11.175C6.03922 11.4671 6.51292 11.625 6.99975 11.625C7.48658 11.625 7.96028 11.4671 8.34975 11.175L8.55 11.025C8.67982 10.9276 8.83772 10.875 9 10.875C9.16228 10.875 9.32018 10.9276 9.45 11.025L9.65025 11.175C10.0397 11.4671 10.5134 11.625 11.0002 11.625C11.4871 11.625 11.9608 11.4671 12.3502 11.175L12.5497 11.025C12.6796 10.9276 12.8375 10.875 12.9998 10.875C13.162 10.875 13.3199 10.9276 13.4498 11.025L13.95 11.4C14.6918 11.9565 15.75 11.427 15.75 10.5V9C15.75 8.40326 15.5129 7.83097 15.091 7.40901C14.669 6.98705 14.0967 6.75 13.5 6.75H9C9.59674 6.75 10.169 6.51295 10.591 6.09099C11.0129 5.66903 11.25 5.09674 11.25 4.5C11.25 3.64125 10.7025 2.8965 10.3102 2.45475C10.0507 2.16225 9.76275 1.88475 9.45 1.65ZM3 13.0613V15C3 15.3978 3.15804 15.7794 3.43934 16.0607C3.72064 16.342 4.10218 16.5 4.5 16.5H13.5C13.8978 16.5 14.2794 16.342 14.5607 16.0607C14.842 15.7794 15 15.3978 15 15V13.0613C14.8255 13.1243 14.6379 13.1426 14.4545 13.1144C14.271 13.0862 14.0976 13.0125 13.95 12.9L13.4498 12.525C13.3199 12.4276 13.162 12.375 12.9998 12.375C12.8375 12.375 12.6796 12.4276 12.5497 12.525L12.3502 12.675C11.9608 12.9671 11.4871 13.125 11.0002 13.125C10.5134 13.125 10.0397 12.9671 9.65025 12.675L9.45 12.525C9.32018 12.4276 9.16228 12.375 9 12.375C8.83772 12.375 8.67982 12.4276 8.55 12.525L8.34975 12.675C7.96028 12.9671 7.48658 13.125 6.99975 13.125C6.51292 13.125 6.03922 12.9671 5.64975 12.675L5.45025 12.525C5.32043 12.4276 5.16253 12.375 5.00025 12.375C4.83797 12.375 4.68007 12.4276 4.55025 12.525L4.05 12.9C3.90241 13.0125 3.72897 13.0862 3.54554 13.1144C3.36211 13.1426 3.17455 13.1243 3 13.0613Z" fill="#88AB61"/>
                          </g>
                          <defs>
                          <clipPath id="clip0_35_533">
                          <rect width="18" height="18" fill="white"/>
                          </clipPath>
                          </defs>
                        </svg>
                        <p>{client.occasion}</p>
                      </div>

                      <div className="flex gap-2  items-center ">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7.99984 8C7.2665 8 6.6665 7.4 6.6665 6.66667C6.6665 5.93333 7.2665 5.33333 7.99984 5.33333C8.73317 5.33333 9.33317 5.93333 9.33317 6.66667C9.33317 7.4 8.73317 8 7.99984 8ZM7.99984 1.33333C5.19984 1.33333 2.6665 3.48 2.6665 6.8C2.6665 9.01333 4.4465 11.6333 7.99984 14.6667C11.5532 11.6333 13.3332 9.01333 13.3332 6.8C13.3332 3.48 10.7998 1.33333 7.99984 1.33333Z" fill="#88AB61"/>
                        </svg>
                        <p>{client.tableNumber}</p>
                        |
                        <p>{client.floor}</p>
                      </div>
                    </div>
                    <h3 className="text-center">Payment Progress</h3>
                    <div className={(statusStyle(client.status))}>
                      {client.status}
                    </div>
                  </div>
                  <div className="flex gap-4 mt-4"> 
                    <button className="btn-primary">Notify</button>
                    <button className="btn-primary">Mark as paid</button>

                  </div>
              </div>
            ))}
          </div>}
        </div>
      </div>
    </div>
  )
}

export default PaymentPage
