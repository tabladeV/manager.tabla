import { useState, useCallback, useRef, useEffect } from "react"
import { toast } from "react-toastify"
import { saveAs } from "file-saver"
import { Check, Download, Loader, X } from "lucide-react"
import axiosInstance from "../providers/axiosInstance"
import ActionPopup from "../components/popup/ActionPopup"

interface Task {
  timeoutId: NodeJS.Timeout | null
  toastId: React.ReactText
  isPolling: boolean
}

export const useAsyncTaskManager = () => {
  const tasksRef = useRef<Record<string, Task>>({})
  const [taskToCancel, setTaskToCancel] = useState<string | null>(null)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  // Cleanup timeouts on component unmount
  useEffect(() => {
    return () => {
      Object.values(tasksRef.current).forEach(task => {
        if (task.timeoutId) {
          clearTimeout(task.timeoutId)
        }
      })
    }
  }, [])

  const stopPolling = useCallback((taskId: string) => {
    if (tasksRef.current[taskId]) {
      if (tasksRef.current[taskId].timeoutId) {
        clearTimeout(tasksRef.current[taskId].timeoutId as NodeJS.Timeout)
      }
      tasksRef.current[taskId].isPolling = false
    }
  }, [])

  const handleCancelConfirmed = useCallback(() => {
    if (taskToCancel && tasksRef.current[taskToCancel]) {
      const { toastId } = tasksRef.current[taskToCancel]
      stopPolling(taskToCancel)
      toast.dismiss(toastId)
      toast.info("Export cancelled.")
      delete tasksRef.current[taskToCancel]
    }
    setShowCancelConfirm(false)
    setTaskToCancel(null)
  }, [taskToCancel, stopPolling])

  const downloadReport = useCallback(async (downloadUrl: string, toastId: React.ReactText) => {
    try {
      toast.update(toastId, {
        render: "Downloading your report...",
        icon: <Loader className="animate-spin" />,
      })
      const response = await axiosInstance.get(downloadUrl, { responseType: "blob" })
      const header = response.headers["content-disposition"]
      const filename = header ? header.split("filename=")[1].replace(/"/g, "") : "report.xlsx"
      saveAs(response.data, filename)
      toast.update(toastId, {
        render: "Download complete!",
        icon: <Check />,
        autoClose: 5000,
      })
    } catch (error) {
      console.error("Download failed:", error)
      toast.update(toastId, {
        render: "Download failed. Please try again.",
        icon: <X />,
        type: "error",
        autoClose: 5000,
      })
    }
  }, [])

  const checkStatus = useCallback(
    async (taskId: string) => {
      // Stop if polling was cancelled
      if (!tasksRef.current[taskId]?.isPolling) {
        return
      }

      const { toastId } = tasksRef.current[taskId]

      try {
        const response = await axiosInstance.get(`/api/v1/bo/reports/status/${taskId}/`)
        const { status, download_url } = response.data

        if (status === "completed") {
          stopPolling(taskId)
          toast.update(toastId, {
            render: () => (
              <div>
                <p>Your report is ready!</p>
                <button className="btn-primary mt-2" onClick={() => downloadReport(download_url, toastId)}>
                  <Download className="inline-block mr-2" size={16} />
                  Download
                </button>
              </div>
            ),
            icon: <Check />,
            autoClose: false,
            closeOnClick: false,
            draggable: false,
            closeButton: true,
          })
        } else if (status === "failed") {
          stopPolling(taskId)
          toast.update(toastId, {
            render: "Report generation failed. Please try again.",
            type: "error",
            icon: <X />,
            autoClose: 5000,
          })
        } else {
          // If still pending, schedule the next check
          const timeoutId = setTimeout(() => checkStatus(taskId), 5000)
          tasksRef.current[taskId].timeoutId = timeoutId
        }
      } catch (error) {
        stopPolling(taskId)
        console.error("Failed to check report status:", error)
        toast.update(toastId, {
          render: "Error checking report status.",
          type: "error",
          icon: <X />,
          autoClose: 5000,
        })
      }
    },
    [downloadReport, stopPolling],
  )

  const startTask = useCallback(
    (taskId: string) => {
      const toastId = toast(
        () => (
          <div>
            <p>Generating your report... This may take a moment.</p>
            <button
              className="btn-danger-outline mt-2 text-xs"
              onClick={() => {
                setTaskToCancel(taskId)
                setShowCancelConfirm(true)
              }}
            >
              Cancel
            </button>
          </div>
        ),
        {
          autoClose: false,
          closeButton: false,
          closeOnClick: false,
          draggable: false,
          icon: <Loader className="animate-spin" />,
        },
      )

      tasksRef.current[taskId] = { toastId, timeoutId: null, isPolling: true }
      checkStatus(taskId)
    },
    [checkStatus],
  )

  const AsyncTaskManager = () => (
    <ActionPopup
      action="cancel"
      message="Are you sure you want to cancel this export? The report generation will be stopped."
      actionFunction={handleCancelConfirmed}
      showPopup={showCancelConfirm}
      setShowPopup={setShowCancelConfirm}
      secondAction={() => setShowCancelConfirm(false)}
      secondActionText="No, continue"
    />
  )

  return { startTask, AsyncTaskManager }
}