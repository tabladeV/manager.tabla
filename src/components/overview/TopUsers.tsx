import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { BaseKey, BaseRecord, useList } from "@refinedev/core";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { useDarkContext } from "../../context/DarkContext";

export default function TopUsers() {
  const { darkMode } = useDarkContext();

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
  const [messagesAPIInfo, setMessagesAPIInfo] = useState<MessagesType>();

  
  const { data: messagesData, isLoading: messagesLoading, error: messagesErr, refetch } = useList({
      resource: "bo/messages/",
      filters: [
        { field: "page", operator: "eq", value: 1 },
        { field: "page_size", operator: "eq", value: 10 },
        { field: "ordering", operator: "eq", value: "-created_at" },
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

    const [messages, setMessages] = useState<Message[]>([]);

      // Effects to update messages from API
    useEffect(() => {
      if (messagesAPIInfo) {
        setMessages(messagesAPIInfo.results);
      }
    }, [messagesAPIInfo]);



    const colors: string[] = []
    const len = messages.length


  for (let i = 0; i < len; i++) {
    if (i % 4 === 0) {
      colors.push('bg-redtheme')
    } else if (i % 4 === 1) {
      colors.push('bg-bluetheme')
    } else if (i % 4 === 2) {
      colors.push('bg-greentheme')
    }
    else {
      colors.push('bg-purpletheme')
    }
  }

  const { t } = useTranslation();
  const [showText, setShowText] = useState(false);

  return (
    <div
      onMouseLeave={() => {
        setShowText(false);
      }}
      onMouseOver={() => {
        setShowText(true);
      }}
      className="rounded-[20px] lt-sm:w-full h-[400px] bg-white dark:bg-bgdarktheme text-blacktheme dark:text-textdarktheme"
    >
      <div className="flex justify-between items-center px-2 py-2">
        <h1 className="text-xl font-bold">{t("overview.messages.title")}</h1>
      </div>
      <div className="cursor-default flex flex-col no-scrollbar overflow-y-scroll h-[330px] gap-4 p-2">
        {messages.map((item, index) => (
          <div key={item.id} className="flex justify-between items-center p-1 rounded-lg hover:bg-[#00000003]">
            <div className="flex items-center gap-2">
              <div className={`w-10 h-10 ${colors[index]} flex justify-center items-center rounded-full text-white`}>
                {item.reservation?.customer?.first_name.slice(0, 1)}
              </div>
              <div>
                <h3 className="text-md">{`${item.reservation?.customer?.first_name} ${item.reservation?.customer?.last_name}`}</h3>
                <p className="text-[14px] text-subblack dark:text-softwhitetheme">
                  {item.text.length > 30 ? `${item.text.substring(0, 30)}...` : item.text}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              
              <p className="text-[12px] text-subblack dark:text-softwhitetheme">{format(item.created_at, "yyyy-MM-dd")} at {format(item.created_at, "HH:mm")}</p>
            </div>
          </div>
        ))}
      </div>
      {showText && (
        <div className="relative flex justify-center">
          <Link to="/messages" className="flex btn-primary shadow-xl shadow-[#00000010] z-50 opacity-100 absolute justify-center mb-[2em] ml-[1em] mt-[-3em] gap-2">
            <p>View all</p>
            <ArrowRight size={20} />
          </Link>
        </div>
      )}
    </div>
  );
}