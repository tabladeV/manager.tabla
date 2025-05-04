"use client"

import { CreditCard, ArrowRight } from "lucide-react"
import { StatusBadge } from "./StatusBadge"
import type { BillType } from "./BillingType"
import { EmptyState } from "./EmptyState"

interface CurrentBillProps {
  currentBill: BillType | null
  handlePayment: () => void
}

export function CurrentBill({ currentBill, handlePayment }: CurrentBillProps) {
  return (
    <div className="mb-12 border border-softgreytheme dark:border-darkthemeitems rounded-lg overflow-hidden shadow-sm">
      <div className="bg-softgreytheme dark:bg-bgdarktheme2 px-6 py-4 border-b border-softgreytheme dark:border-darkthemeitems">
        <h2 className="text-xl font-semibold text-blacktheme dark:text-textdarktheme">Current Bill</h2>
      </div>

      <div className="p-6 bg-whitetheme dark:bg-bgdarktheme2">
        {currentBill ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div>
                <p className="text-subblack dark:text-textdarktheme/80 mb-1">Invoice</p>
                <p className="text-blacktheme dark:text-textdarktheme font-medium">{currentBill.id}</p>
              </div>
              <div>
                <p className="text-subblack dark:text-textdarktheme/80 mb-1">Billing Period</p>
                <p className="text-blacktheme dark:text-textdarktheme font-medium">{currentBill.period}</p>
              </div>
              <div>
                <p className="text-subblack dark:text-textdarktheme/80 mb-1">Due Date</p>
                <p className="text-blacktheme dark:text-textdarktheme font-medium">{currentBill.dueDate}</p>
              </div>
              <div>
                <p className="text-subblack dark:text-textdarktheme/80 mb-1">Status</p>
                <StatusBadge status={currentBill.status} />
              </div>
            </div>

            <div className="border-t border-softgreytheme dark:border-darkthemeitems pt-4 mb-6">
              <h3 className="text-lg font-medium mb-3 text-blacktheme dark:text-textdarktheme">Bill Details</h3>
              <div className="space-y-2 max-w-2xl">
                {currentBill.items.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-subblack dark:text-textdarktheme/80">{item.name}</span>
                    <span className="text-blacktheme dark:text-textdarktheme">${item.price.toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-softgreytheme dark:border-darkthemeitems pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span className="text-blacktheme dark:text-textdarktheme">Total</span>
                    <span className="text-blacktheme dark:text-textdarktheme">${currentBill.amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {currentBill.status === "pending" && (
              <div className="flex justify-end">
                <button
                  onClick={handlePayment}
                  className="flex items-center px-6 py-3 bg-greentheme hover:bg-greentheme/90 text-whitetheme rounded-md transition-colors"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Pay Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            )}
          </>
        ) : (
          <EmptyState message="No current bill available." />
        )}
      </div>
    </div>
  )
}
