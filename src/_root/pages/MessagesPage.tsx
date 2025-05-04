import { useEffect, useState } from "react";
import { format } from "date-fns";
import { BaseKey, BaseRecord, useList, useForm } from "@refinedev/core";
import SearchBar from "../../components/header/SearchBar";
import Pagination from "../../components/reservation/Pagination";
import { MessageSquare, User, Calendar, ArrowRight, Reply } from "lucide-react";
import { useTranslation } from "react-i18next";
import profilepic from '../../assets/profile.png';
import { t } from "i18next";
import { useDarkContext } from "../../context/DarkContext";

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
  onReplyMessage: (message: Message) => void;
}

interface MessageRowProps {
  message: Message;
  onReply: () => void;
}

interface NotificationModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  message: Message | null;
  onSubmit: (values: { message: string }) => void;
  formLoading: boolean;
}

interface MessagesFiltersProps {
  focusedFilter: string;
  setFocusedFilter: (filter: string) => void;
  selectingDay: string;
  setFocusedDate: (focused: boolean) => void;
  setDefaultFilter: () => void;
}

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
        className={`gap-2 flex items-center text-blacktheme dark:text-whitetheme ${selectingDay === '' ? 'btn' : 'btn-primary'}`} 
        onClick={() => setFocusedDate(true)}
      >
        {t('reservations.filters.date')}
      </button>
      <button onClick={setDefaultFilter} className={`text-blacktheme dark:text-whitetheme ${(focusedFilter === '') && (selectingDay === '') ? 'btn-primary' : 'btn'}`}>
        {t('reservations.filters.all')}
      </button>
    </div>
  )
}

// Main MessagesPage Component
const MessagesPage = () => {
  const { darkMode } = useDarkContext();
  
  useEffect(() => {
    document.title = "Messages | Tabla";
  }, []);

  // States
  const [page, setPage] = useState<number>(1);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesAPIInfo, setMessagesAPIInfo] = useState<MessagesType>();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState<boolean>(false);

  const [size, setSize] = useState<number>(16);
  // Fetch messages
  const { data, isLoading, error, refetch } = useList({
    resource: "bo/messages/",

    filters: [
      { field: "page", operator: "eq", value: page },
      { field: "page_size", operator: "eq", value: size },
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
    resource: `bo/messages/${selectedMessage?.id}/create_response/`,
    action: "create",
    redirect: false, 
    onMutationSuccess: () => {
      setShowNotificationModal(false);
      setSelectedMessage(null);
      // Refresh messages to see updates
      refetch();
    },
    errorNotification: (error, values) => {
      return {
        type: 'error',
        message: error?.message || "An error occurred while sending the message",
      };
    },
    successNotification: () => {
      return {
        type: 'success',
        message: "Message sent successfully",
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

  const handleReplyMessage = (message: Message) => {
    setSelectedMessage(message);
    setShowNotificationModal(true);
  };

  const handleSubmitNotification = (formValues: { message: string }) => {
    if (!selectedMessage?.reservation?.customer?.id && !selectedMessage?.id) return;
    
    const formData = new FormData();
    
    // Add single customer ID
    formData.append('user', String(selectedMessage?.reservation?.customer?.id));
    
    // Append other form fields
    formData.append('restaurant', localStorage.getItem('restaurant_id') || '');
    formData.append('message', String(selectedMessage?.id));
    formData.append('text_massage', formValues.message);

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
          message={selectedMessage}
          onSubmit={handleSubmitNotification}
          formLoading={formLoading}
        />
      )}

      {/* Page Header */}
      <div className="flex justify-between mb-4 lt-sm:flex-col lt-sm:gap-2">
        <h1 className="text-3xl font-[700] text-blacktheme dark:text-whitetheme">
          {t('messages.title')}
        </h1>
      </div>

      {/* Search */}
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
          onReplyMessage={handleReplyMessage}
        />
        <Pagination
          setPage={(newPage) => {
            setPage(newPage);
          }}
          size={size}
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
  onReplyMessage,
}) => {
  return (
    <table className="min-w-full rounded-lg overflow-auto">
      <thead className="bg-gray-50 dark:bg-bgdarktheme2 text-gray-500 dark:text-white">
        <tr>
          <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">
            From
          </th>
          <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">
            Message
          </th>
          <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">
            Response
          </th>
          <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider">
            Received
          </th>
          <th className="w-12 px-3 py-3"></th>
        </tr>
      </thead>
      <tbody className="bg-white dark:bg-bgdarktheme divide-y divide-gray-200 dark:divide-gray-700">
        {isLoading ? (
          [...Array(5)].map((_, index) => <LoadingRow key={index} />)
        ) : messages.length === 0 ? (
          <tr>
            <td colSpan={4} className="py-4 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No messages found
              </p>
            </td>
          </tr>
        ) : (
          messages.map((message) => (
            <MessageRow
              key={message.id}
              message={message}
              onReply={() => onReplyMessage(message)}
            />
          ))
        )}
      </tbody>
    </table>
  );
};

// MessageRow Component
const MessageRow: React.FC<MessageRowProps> = ({ message, onReply }) => {
  const { darkMode } = useDarkContext();
  const date = new Date(message.created_at);
  const formattedDate = format(date, "dd MMM yyyy");
  const formattedTime = format(date, "HH:mm");

  return (
    <tr className="transition-colors hover:bg-gray-50 dark:hover:bg-darkthemeitems">
      <td className="px-3 py-4">
        <div className="flex items-center">
          <img 
            className="h-10 w-10 rounded-full object-cover" 
            src={profilepic} 
            alt="User avatar"
          />
          <div className="ml-4">
            <div className="font-medium text-gray-900 dark:text-white">
              {`${message?.reservation?.customer?.first_name} ${message?.reservation?.customer?.last_name}`  || "Customer"}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {message?.reservation?.customer?.email || "No email provided"}
            </div>
          </div>
        </div>
      </td>
      <td className="px-3 py-4">
        <div className="flex items-start gap-2">
          <MessageSquare size={16} className="mt-1 text-gray-500 dark:text-gray-400" />
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {message.text.length > 120 ? `${message.text.substring(0, 120)}...` : message.text}
          </p>
        </div>
      </td>
      <td className="px-3 py-4">

        {message.response &&
          <div className="flex items-start gap-2">
            <MessageSquare size={16} className="mt-1 text-gray-500 dark:text-gray-400" />
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {message.response?.text_massage?.length > 120 ? `${message.response?.text_massage?.substring(0, 120)}...` : message.response?.text_massage}
            </p>
          </div>
        }
      </td>
      <td className="px-3 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-500 dark:text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {formattedDate} at {formattedTime}
          </span>
        </div>
      </td>
      <td className="px-3 py-4 whitespace-nowrap">
        {!message.response && 
        <button
          onClick={onReply}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          title="Reply to message"
        >
          <Reply size={16} />
        </button>}
      </td>
    </tr>
  );
};

// Loading Row Component
const LoadingRow: React.FC = () => {
  return (
    <tr>
      <td className="px-3 py-4">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-darkthemeitems"></div>
          <div className="ml-4 space-y-1">
            <div className="h-4 w-24 rounded bg-gray-200 dark:bg-darkthemeitems"></div>
            <div className="h-3 w-32 rounded bg-gray-200 dark:bg-darkthemeitems"></div>
          </div>
        </div>
      </td>
      <td className="px-3 py-4">
        <div className="space-y-1">
          <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-darkthemeitems"></div>
          <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-darkthemeitems"></div>
        </div>
      </td>
      <td className="px-3 py-4 whitespace-nowrap">
        <div className="h-4 w-32 rounded bg-gray-200 dark:bg-darkthemeitems"></div>
      </td>
      <td className="px-3 py-4 whitespace-nowrap">
        <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-darkthemeitems"></div>
      </td>
    </tr>
  );
};

// NotificationModal Component
const NotificationModal: React.FC<NotificationModalProps> = ({
  showModal,
  setShowModal,
  message,
  onSubmit,
  formLoading
}) => {
  const { darkMode } = useDarkContext();
  const [responseMessage, setResponseMessage] = useState("");

  // Reset values when modal opens/closes
  useEffect(() => {
    if (!showModal) {
      setResponseMessage("");
    }
  }, [showModal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ message: responseMessage });
  };

  if (!showModal || !message) return null;

  const customerName = message?.reservation?.customer 
    ? `${message.reservation.customer.first_name} ${message.reservation.customer.last_name}` 
    : "Customer";

  return (
    <div>
      <div className="overlay" onClick={() => setShowModal(false)}></div>
      <div className="sidepopup h-full lt-sm:w-full overflow-y-auto lt-sm:h-[70vh] lt-sm:bottom-0 bg-white dark:bg-bgdarktheme">
        <h2 className="text-2xl font-semibold mb-6 text-blacktheme dark:text-white">
          Respond to {customerName}
        </h2>
        
        {/* Original message */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Original message:</p>
          <p className="text-gray-700 dark:text-gray-200">{message.text}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Message */}
          <textarea
            placeholder="Type your response here"
            rows={5}
            value={responseMessage}
            onChange={(e) => setResponseMessage(e.target.value)}
            className="inputs-unique bg-white dark:bg-bgdarktheme2 dark:focus:border-none"
            required
          ></textarea>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              className="btn-secondary text-blacktheme dark:text-white"
              onClick={() => setShowModal(false)}
              disabled={formLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`btn-primary ${formLoading ? 'opacity-70 cursor-wait' : ''}`}
              disabled={!responseMessage || formLoading}
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