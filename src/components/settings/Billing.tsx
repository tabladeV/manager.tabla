"use client"

import { useState } from "react"
import { BillingHeader } from "./billingComp/BillingHeader"
import { CurrentBill } from "./billingComp/CurrentBill"
import { BillingHistory } from "./billingComp/BillingHistory"
import { BillType, BillingHistoryType } from "./billingComp/BillingType"
import { EmptyState } from "./billingComp/EmptyState"

export default function Billing() {
  // Sample data - in a real app, this would come from an API
  const [currentBill, setCurrentBill] = useState<BillType | null>({
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

  const [billingHistory, setBillingHistory] = useState<BillingHistoryType[]>([
    // {
    //   id: "INV-2023-03-28",
    //   date: "Mar 28, 2023",
    //   amount: 49.99,
    //   status: "paid",
    //   period: "Mar 28, 2023 - Apr 28, 2023",
    // },
    // {
    //   id: "INV-2023-02-28",
    //   date: "Feb 28, 2023",
    //   amount: 39.99,
    //   status: "paid",
    //   period: "Feb 28, 2023 - Mar 28, 2023",
    // },
    // {
    //   id: "INV-2023-01-28",
    //   date: "Jan 28, 2023",
    //   amount: 39.99,
    //   status: "paid",
    //   period: "Jan 28, 2023 - Feb 28, 2023",
    // },
    // {
    //   id: "INV-2022-12-28",
    //   date: "Dec 28, 2022",
    //   amount: 39.99,
    //   status: "paid",
    //   period: "Dec 28, 2022 - Jan 28, 2023",
    // },
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

  return (
    <div className="w-full px-4 py-8 bg-whitetheme dark:bg-bgdarktheme">
      <BillingHeader />
      
      {/* Current Bill Section */}
      <CurrentBill 
        // currentBill={currentBill} 
        currentBill={null} 
        handlePayment={handlePayment} 
      />

      {/* Billing History Section */}
      <BillingHistory 
        billingHistory={billingHistory} 
        downloadPDF={downloadPDF} 
      />
    </div>
  )
}
