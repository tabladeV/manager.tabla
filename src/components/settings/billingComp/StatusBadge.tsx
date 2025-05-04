import { CheckCircle, Calendar, AlertCircle } from "lucide-react"
import type { BillStatus } from "./BillingType"

interface StatusBadgeProps {
  status: BillStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case "paid":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-softgreentheme text-greentheme dark:bg-softgreentheme dark:text-greentheme">
          <CheckCircle className="w-3 h-3 mr-1" />
          Paid
        </span>
      )
    case "pending":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-softbluetheme text-bluetheme dark:bg-softorangetheme dark:text-bluetheme">
          <Calendar className="w-3 h-3 mr-1" />
          Pending
        </span>
      )
    case "overdue":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-softredtheme text-redtheme dark:bg-softredtheme dark:text-redtheme">
          <AlertCircle className="w-3 h-3 mr-1" />
          Overdue
        </span>
      )
    default:
      return null
  }
}
