import { useEffect, useState } from "react";
import { format } from "date-fns";
import { BaseKey, BaseRecord, useList, useForm } from "@refinedev/core";
import SearchBar from "../../components/header/SearchBar";
import Pagination from "../../components/reservation/Pagination";
import { MessageSquare, User, Calendar, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import profilepic from '../../assets/profile.png';
import { t } from "i18next";
// Types and Interfaces
interface Message extends BaseRecord {
  id: BaseKey;
  text: string;
  created_at: string;
  updated_at: string;
  reservation?: {
    customer?: {
      id: BaseKey;
      first_name: string;
      full_name: string;
      last_name: string;
      email: string;
      phone?: string;
    };
    date?: string,
    time?: string,
    id?: BaseKey;
  };
  restaurant: number;
}

interface MessagesType {
  results: Message[];
  count: number;
}

interface MessageTableProps {
  isLoading: boolean;
  messages: Message[];
  onSelectMessage: (message: Message) => void;
  selectedMessages: Message[];
}

interface MessageRowProps {
  message: Message;
  isSelected: boolean;
  onSelect: () => void;
}

interface NotificationModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  selectedMessages: Message[];
  onSubmit: (values: { subject: string; message: string }) => void;
  formLoading: boolean;
}

interface MessagesFiltersProps {
  focusedFilter: string;
  setFocusedFilter: (filter: string) => void;
  selectingDay: string;
  setFocusedDate: (focused: boolean) => void;
  setDefaultFilter: () => void;
}

const isDarkMode = localStorage.getItem("darkMode") === "true";

// ReservationFilters Component
const MessagesFilters: React.FC<MessagesFiltersProps> = ({ 
  focusedFilter, 
  setFocusedFilter, 
  selectingDay, 
  setFocusedDate, 
  setDefaultFilter,
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap gap-2 mx-1">
      <button 
        className={`gap-2 flex items-center ${isDarkMode ? 'text-whitetheme' : ''} ${selectingDay === '' ? 'btn' : 'btn-primary'}`} 
        onClick={() => setFocusedDate(true)}
      >
        {t('reservations.filters.date')}
      </button>
      <button onClick={setDefaultFilter} className={`${isDarkMode ? 'text-whitetheme' : ''} ${(focusedFilter === '') && (selectingDay === '') ? 'btn-primary' : 'btn'}`}>
        {t('reservations.filters.all')}
      </button>
    </div>
  )
}

// Main MessagesPage Component
const MessagesPage = () => {
  useEffect(() => {
    document.title = "Messages | Tabla";
  }, []);

  // States
  const [page, setPage] = useState<number>(1);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesAPIInfo, setMessagesAPIInfo] = useState<MessagesType>();
  const [selectedMessages, setSelectedMessages] = useState<Message[]>([]);
  const [showNotificationModal, setShowNotificationModal] = useState<boolean>(false);

  // Fetch messages
  const { data, isLoading, error, refetch } = useList({
    resource: "bo/messages/",
    filters: [
      { field: "page", operator: "eq", value: page },
      { field: "page_size", operator: "eq", value: 20 },
      { field: "search", operator: "eq", value: searchKeyword },
    ],
    queryOptions: {
      onSuccess: (data) => {
        setMessagesAPIInfo(data.data as unknown as MessagesType);
      }
    },
    errorNotification(error, values, resource) {
      return {
        type: 'error',
        message: error?.formattedMessage,
      };
    },
  });

  // Use Refine's useForm hook for form handling - configured for FormData
  const { onFinish, formLoading, mutationResult } = useForm({
    resource: "api/v1/bo/notifications/",
    action: "create",
    redirect: false, 
    onMutationSuccess: () => {
      setShowNotificationModal(false);
      setSelectedMessages([]);
      // Refresh messages to see updates
      refetch();
    },
    errorNotification: (error, values) => {
      return {
        type: 'error',
        message: error?.message || "An error occurred while sending notifications",
      };
    },
    successNotification: () => {
      return {
        type: 'success',
        message: "Notifications sent successfully",
      };
    },
  });

  // Effects to update messages from API
  useEffect(() => {
    if (messagesAPIInfo) {
      setMessages(messagesAPIInfo.results);
    }
  }, [messagesAPIInfo]);

  // Handler functions
  const searchFilter = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const keyword = e.target.value.toLowerCase();
    setSearchKeyword(keyword);
  };

  const handleSelectMessage = (message: Message) => {
    setSelectedMessages(prev => {
      const isAlreadySelected = prev.some(m => m.id === message.id);
      if (isAlreadySelected) {
        return prev.filter(m => m.id !== message.id);
      } else {
        return [...prev, message];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedMessages.length === messages.length) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages([...messages]);
    }
  };

  const handleSubmitNotification = (formValues: { subject: string; message: string }) => {
    const formData = new FormData();
    // Get unique customer IDs from selected messages
    const customerIds = Array.from(
      new Set(selectedMessages.map(message => Number(message.reservation?.customer?.id || 0)).filter(Boolean))
    ) as BaseKey[];
    selectedMessages.map(message => {
      if (message?.reservation?.customer?.id) {
        formData.append('customers', message.reservation.customer.id.toString());
      }
    })
    
  
    
    // Append customer IDs as a comma-separated string or as individual form fields
    // formData.append('customers', JSON.stringify(customerIds.join(',')));
    // formData.append('customers', customerIds.join(','));
    
    // Append other form fields
    formData.append('restaurant', localStorage.getItem('restaurant_id') || '');
    formData.append('subject', formValues.subject);
    formData.append('message', formValues.message);

    // Submit the form with FormData
    onFinish(formData as any);
  };

  return (
    <div className="relative">
      {/* Notification Modal */}
      {showNotificationModal && (
        <NotificationModal
          showModal={showNotificationModal}
          setShowModal={setShowNotificationModal}
          selectedMessages={selectedMessages}
          onSubmit={handleSubmitNotification}
          formLoading={formLoading}
        />
      )}

      {/* Page Header */}
      <div className="flex justify-between mb-4 lt-sm:flex-col lt-sm:gap-2">
        <h1 className={`text-3xl font-[700] ${isDarkMode ? "text-whitetheme" : "text-blacktheme"}`}>
          {t('messages.title')}
        </h1>
        <div className="flex gap-4 justify-end">
          <button
            onClick={() => setShowNotificationModal(true)}
            disabled={selectedMessages.length === 0}
            className={`${
              selectedMessages.length === 0
                ? isDarkMode
                  ? "btn hover:border-[0px] border-[0px] cursor-not-allowed bg-subblack text-softwhitetheme"
                  : "btn hover:border-[0px] border-[0px] cursor-not-allowed bg-softgreytheme"
                : "btn-primary"
            }`}
          >
            Respond
          </button>
        </div>
      </div>

      {/* Search and Action Buttons */}
      <div className="flex lt-xl:flex-col lt-xl:gap-2 justify-between">
        <div className="md-only:w-[50%] lg-only:w-[50%]">
          <SearchBar SearchHandler={searchFilter} />
        </div>
      </div>

      {/* Messages Table */}
      <div className="overflow-x-auto">
        <MessageTable
          isLoading={isLoading}
          messages={messages}
          onSelectMessage={handleSelectMessage}
          selectedMessages={selectedMessages}
        />
        <Pagination
          setPage={(newPage) => {
            setPage(newPage);
          }}
          size={20}
          count={messagesAPIInfo?.count || 0}
        />
      </div>
    </div>
  );
};

// MessageTable Component
const MessageTable: React.FC<MessageTableProps> = ({
  isLoading,
  messages,
  onSelectMessage,
  selectedMessages,
}) => {
  return (
    <table className="min-w-full rounded-lg overflow-auto">
    <thead className={isDarkMode ? "bg-bgdarktheme2 text-white" : "bg-gray-50 text-gray-500"}>
      <tr>
        <th className="w-12 px-3 py-3"></th>
        <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">
          From
        </th>
        <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">
          Message
        </th>
        <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">
          Received
        </th>
        <th className="w-12 px-3 py-3"></th>
      </tr>
    </thead>
    <tbody className={`divide-y bg-white dark:divide-gray-700 dark:bg-bgdarktheme divide-gray-200`}>
      {isLoading ? (
        [...Array(5)].map((_, index) => <LoadingRow key={index}  />)
      ) : messages.length === 0 ? (
        <tr>
          <td colSpan={5} className="py-4 text-center">
            <p className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
              No messages found
            </p>
          </td>
        </tr>
      ) : (
        messages.map((message) => (
          <MessageRow
            key={message.id}
            message={message}
            isSelected={selectedMessages.some((m) => m.id === message.id)}
            onSelect={() => onSelectMessage(message)}
          />
        ))
      )}
    </tbody>
  </table>
  );
};

// MessageRow Component
const MessageRow: React.FC<MessageRowProps> = ({ message, isSelected, onSelect }) => {
  const date = new Date(message.created_at);
  const formattedDate = format(date, "dd MMM yyyy");
  const formattedTime = format(date, "HH:mm");

  return (
    <tr
      className={`transition-colors hover:bg-gray-50 ${isDarkMode ? "hover:bg-gray-800" : ""} ${
        isSelected ? (isDarkMode ? "bg-gray-800" : "bg-blue-50") : ""
      }`}
    >
      <td className="px-3 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="checkbox h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>
      </td>
      <td className="px-3 py-4 cursor-pointer" onClick={onSelect}>
        <div className="flex items-center">
          <img 
            className="h-10 w-10 rounded-full object-cover" 
            src={profilepic} 
            alt="User avatar"
          />
          <div className="ml-4">
            <div className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              {`${message?.reservation?.customer?.first_name} ${message?.reservation?.customer?.last_name}`  || "Customer"}
            </div>
            <div className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              {message?.reservation?.customer?.email || "No email provided"}
            </div>
          </div>
        </div>
      </td>
      <td className="px-3 py-4 cursor-pointer" onClick={onSelect}>
        <div className="flex items-start gap-2">
          <MessageSquare size={16} className={`mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
          <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
            {message.text.length > 120 ? `${message.text.substring(0, 120)}...` : message.text}
          </p>
        </div>
      </td>
      <td className="px-3 py-4 whitespace-nowrap cursor-pointer" onClick={onSelect}>
        <div className="flex items-center gap-2">
          <Calendar size={16} className={isDarkMode ? "text-gray-400" : "text-gray-500"} />
          <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
            {formattedDate} at {formattedTime}
          </span>
        </div>
      </td>
      <td className="px-3 py-4 whitespace-nowrap">
        <button
          onClick={onSelect}
          className={`p-2 rounded-full ${
            isSelected
              ? "bg-green-100 text-green-600"
              : isDarkMode
              ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <ArrowRight size={16} />
        </button>
      </td>
    </tr>
  );
};

// Loading Row Component
const LoadingRow: React.FC = () => {
  return (
    <tr>
      <td className="px-3 py-4 whitespace-nowrap">
        <div className={`h-4 w-4 rounded ${isDarkMode ? "bg-darkthemeitems" : "bg-gray-200"}`}></div>
      </td>
      <td className="px-3 py-4">
        <div className="flex items-center">
          <div className={`h-10 w-10 rounded-full ${isDarkMode ? "bg-darkthemeitems" : "bg-gray-200"}`}></div>
          <div className="ml-4 space-y-1">
            <div className={`h-4 w-24 rounded ${isDarkMode ? "bg-darkthemeitems" : "bg-gray-200"}`}></div>
            <div className={`h-3 w-32 rounded ${isDarkMode ? "bg-darkthemeitems" : "bg-gray-200"}`}></div>
          </div>
        </div>
      </td>
      <td className="px-3 py-4">
        <div className="space-y-1">
          <div className={`h-4 w-3/4 rounded ${isDarkMode ? "bg-darkthemeitems" : "bg-gray-200"}`}></div>
          <div className={`h-4 w-1/2 rounded ${isDarkMode ? "bg-darkthemeitems" : "bg-gray-200"}`}></div>
        </div>
      </td>
      <td className="px-3 py-4 whitespace-nowrap">
        <div className={`h-4 w-32 rounded ${isDarkMode ? "bg-darkthemeitems" : "bg-gray-200"}`}></div>
      </td>
      <td className="px-3 py-4 whitespace-nowrap">
        <div className={`h-8 w-8 rounded-full ${isDarkMode ? "bg-darkthemeitems" : "bg-gray-200"}`}></div>
      </td>
    </tr>
  );
};

// NotificationModal Component
const NotificationModal: React.FC<NotificationModalProps> = ({
  showModal,
  setShowModal,
  selectedMessages,
  onSubmit,
  formLoading
}) => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  // Reset values when modal opens/closes
  useEffect(() => {
    if (!showModal) {
      setSubject("");
      setMessage("");
    }
  }, [showModal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ subject, message });
  };

  if (!showModal) return null;

  return (
    <div>
      <div className="overlay" onClick={() => setShowModal(false)}></div>
      <div
        className={`sidepopup h-full lt-sm:w-full overflow-y-auto lt-sm:h-[70vh] lt-sm:bottom-0 ${
          isDarkMode ? "bg-bgdarktheme" : "bg-white"
        }`}
      >
        <h2 className="text-2xl font-semibold mb-6">
          Respond to Message
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="p-2 rounded-[10px] cursor-default">
            <p className="text-greentheme font-[600] mb-2">
              Send to
            </p>
            <div className="flex gap-2 flex-wrap">
              {selectedMessages.slice(0, 4).map((message) => (
                <div
                  key={message.id}
                  className={`flex items-center gap-2 ${isDarkMode ? "text-white" : ""}`}
                >
                  <p className={`text-sm btn ${isDarkMode ? "text-white" : ""}`}>
                    {`${message?.reservation?.customer?.first_name} ${message?.reservation?.customer?.last_name}` || `Customer #${message.reservation}`}
                  </p>
                </div>
              ))}
              {selectedMessages.length > 4 && (
                <p className={`text-sm btn ${isDarkMode ? "text-white" : ""}`}>
                  and {selectedMessages.length - 4} more
                </p>
              )}
            </div>
          </div>

          {/* Subject */}
          <input
            type="text"
            placeholder="Subject"
            className={`inputs-unique ${isDarkMode ? "bg-bgdarktheme2" : "bg-white"}`}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />

          {/* Message */}
          <textarea
            placeholder="Type your message here"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={`inputs-unique ${
              isDarkMode ? "bg-bgdarktheme2 focus:border-none" : "bg-white"
            }`}
            required
          ></textarea>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              className={`btn-secondary ${isDarkMode ? "text-white" : ""}`}
              onClick={() => setShowModal(false)}
              disabled={formLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`btn-primary ${formLoading ? 'opacity-70 cursor-wait' : ''}`}
              disabled={!subject || !message || formLoading}
            >
              {formLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MessagesPage;