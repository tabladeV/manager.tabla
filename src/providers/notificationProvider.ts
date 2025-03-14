import React from "react";
import type { NotificationProvider } from "@refinedev/core";
import { toast } from "react-toastify";
import ErrorToast from "../components/common/ErrorToast";

export const notificationProvider: NotificationProvider = {
  open: ({ key, message, type, undoableTimeout, cancelMutation }) => {
    try {
      // Handle error notifications specifically
      if (type === "error") {
        if (toast.isActive(key as React.ReactText)) {
          toast.update(key as React.ReactText, {
            render: ErrorToast({error: { message }}),
            closeButton: true,
            autoClose: 8000, // Give users more time to read error messages
            type,
          });
        } else {
          toast(ErrorToast({error: { message }}), {
            toastId: key,
            type,
            autoClose: 8000,
          });
        }
        return;
      }
      
      // Handle progress notifications
      if (type === "progress") {
        if (toast.isActive(key as React.ReactText)) {
          toast.update(key as string, {
            progress: undoableTimeout && (undoableTimeout / 10) * 2,
            render: 'some redered stuf until we fix this mess',
            type: "default",
          });
        } else {
          toast('some text until we fix this issue');
        }
      } else {
        // Handle all other notification types
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
    } catch (err) {
      console.log('Error in notification provider:', err);
      
      // Fallback toast in case of error
      toast(ErrorToast({error: { message }}), {
        type: 'error',
      });
    }
  },
  close: (key) => toast.dismiss(key),
};