import { FileX } from "lucide-react"

interface EmptyStateProps {
  message: string
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <FileX className="w-12 h-12 text-subblack dark:text-textdarktheme/60 mb-4" />
      <p className="text-subblack dark:text-textdarktheme/80">{message}</p>
    </div>
  )
}
