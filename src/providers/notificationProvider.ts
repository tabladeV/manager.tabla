import UndoableNotification from './../components/common/UndoableNotification';
import React from "react";
import type { NotificationProvider } from "@refinedev/core";
import { toast } from "react-toastify";

export const notificationProvider: NotificationProvider = {
  open: ({ key, message, type, undoableTimeout, cancelMutation }) => {
    try {
      
    if (type === "progress") {
      if (toast.isActive(key as React.ReactText)) {
        toast.update(key as string, {
          progress: undoableTimeout && (undoableTimeout / 10) * 2,
        //   render: ((<UndoableNotification message={message} cancelMutation={cancelMutation} />) as unknown),
          render: 'some redered stuf until we fix this mess',
          type: "default",
        });
      } else {
        toast('some text until we fix this issue'
        //   <UndoableNotification
        //     message={message}
        //     cancelMutation={cancelMutation}
        //   />,
        //   {
        //     toastId: key,
        //     updateId: key,
        //     closeOnClick: false,
        //     closeButton: false,
        //     autoClose: false,
        //     progress: undoableTimeout && (undoableTimeout / 10) * 2,
        //   },
        );
      }
    } else {
      if (toast.isActive(key as React.ReactText)) {
        toast.update(key as React.ReactText, {
          render: message,
          closeButton: true,
          autoClose: 5000,
          type,
        });
      } else {
        toast(message, {
          toastId: key,
          type,
        });
      }
    }
    } catch (err){
      console.log('eeeeeeeeeeeeeeeee', err)
    }
  },
  close: (key) => toast.dismiss(key),
};
