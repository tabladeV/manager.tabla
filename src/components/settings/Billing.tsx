"use client"

import { useState } from "react"
import { Download, FileText, CreditCard, Calendar, ArrowRight, CheckCircle, AlertCircle } from "lucide-react"

export default function Billing() {
  // Sample data - in a real app, this would come from an API
  const [currentBill, setCurrentBill] = useState({
    id: "INV-2023-04-28",
    amount: 49.99,
    dueDate: "2023-05-15",
    status: "pending", // pending, paid, overdue
    period: "Apr 28, 2023 - May 28, 2023",
    items: [
      { name: "Basic Plan", price: 39.99 },
      { name: "Additional Storage", price: 10.0 },
    ],
  })

  const [billingHistory, setBillingHistory] = useState([
    {
      id: "INV-2023-03-28",
      date: "Mar 28, 2023",
      amount: 49.99,
      status: "paid",
      period: "Mar 28, 2023 - Apr 28, 2023",
    },
    {
      id: "INV-2023-02-28",
      date: "Feb 28, 2023",
      amount: 39.99,
      status: "paid",
      period: "Feb 28, 2023 - Mar 28, 2023",
    },
    {
      id: "INV-2023-01-28",
      date: "Jan 28, 2023",
      amount: 39.99,
      status: "paid",
      period: "Jan 28, 2023 - Feb 28, 2023",
    },
    {
      id: "INV-2022-12-28",
      date: "Dec 28, 2022",
      amount: 39.99,
      status: "paid",
      period: "Dec 28, 2022 - Jan 28, 2023",
    },
  ])

  // Function to handle payment - would connect to payment processor in real app
  const handlePayment = () => {
    alert("Redirecting to payment gateway...")
    // In a real app, this would redirect to a payment processor
  }

  // Function to download PDF - would generate PDF in real app
  const downloadPDF = (invoiceId: string) => {
    alert(`Downloading invoice ${invoiceId} as PDF...`)
    // In a real app, this would trigger a PDF download
  }

  // Helper function to render status badge
  const renderStatusBadge = (status: string) => {
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

  return (
    <div className="w-full px-4 py-8 bg-whitetheme dark:bg-bgdarktheme">
      <h1 className="text-3xl font-bold mb-8 text-blacktheme dark:text-textdarktheme">Billing</h1>

      {/* Current Bill Section */}
      <div className="mb-12 border border-softgreytheme dark:border-darkthemeitems rounded-lg overflow-hidden shadow-sm">
        <div className="bg-softgreytheme dark:bg-bgdarktheme2 px-6 py-4 border-b border-softgreytheme dark:border-darkthemeitems">
          <h2 className="text-xl font-semibold text-blacktheme dark:text-textdarktheme">Current Bill</h2>
        </div>

        <div className="p-6 bg-whitetheme dark:bg-bgdarktheme2">
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
              {renderStatusBadge(currentBill.status)}
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
        </div>
      </div>

      {/* Billing History Section */}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{renderStatusBadge(bill.status)}</td>
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
                  <td colSpan={6} className="px-6 py-8 text-center text-subblack dark:text-textdarktheme/80">
                    No billing history available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
