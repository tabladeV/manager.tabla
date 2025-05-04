"use client"

import { Download, FileText } from "lucide-react"
import { StatusBadge } from "./StatusBadge"
import type { BillingHistoryType } from "./BillingType"
import { EmptyState } from "./EmptyState"

interface BillingHistoryProps {
  billingHistory: BillingHistoryType[]
  downloadPDF: (invoiceId: string) => void
}

export function BillingHistory({ billingHistory, downloadPDF }: BillingHistoryProps) {
  return (
    <div className="border border-softgreytheme dark:border-darkthemeitems rounded-lg overflow-hidden shadow-sm">
      <div className="bg-softgreytheme dark:bg-bgdarktheme2 px-6 py-4 border-b border-softgreytheme dark:border-darkthemeitems">
        <h2 className="text-xl font-semibold text-blacktheme dark:text-textdarktheme">Billing History</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-softgreytheme dark:bg-darkthemeitems">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-blacktheme dark:text-textdarktheme uppercase tracking-wider">
                Invoice
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blacktheme dark:text-textdarktheme uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blacktheme dark:text-textdarktheme uppercase tracking-wider">
                Billing Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blacktheme dark:text-textdarktheme uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blacktheme dark:text-textdarktheme uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-blacktheme dark:text-textdarktheme uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-whitetheme dark:bg-bgdarktheme2 divide-y divide-softgreytheme dark:divide-darkthemeitems">
            {billingHistory.length > 0 ? (
              billingHistory.map((bill) => (
                <tr key={bill.id} className="hover:bg-softgreytheme dark:hover:bg-darkthemeitems transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blacktheme dark:text-textdarktheme">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-subblack dark:text-textdarktheme/60" />
                      {bill.id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-subblack dark:text-textdarktheme/80">
                    {bill.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-subblack dark:text-textdarktheme/80">
                    {bill.period}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blacktheme dark:text-textdarktheme">
                    ${bill.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <StatusBadge status={bill.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <button
                      onClick={() => downloadPDF(bill.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-softgreytheme dark:border-darkthemeitems rounded-md bg-whitetheme dark:bg-bgdarktheme hover:bg-softgreytheme dark:hover:bg-darkthemeitems text-blacktheme dark:text-textdarktheme transition-colors"
                    >
                      <Download className="w-4 h-4 mr-1 text-bluetheme" />
                      PDF
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>
                  <EmptyState message="No billing history available." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
