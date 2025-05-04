export type BillStatus = "pending" | "paid" | "overdue"

export type BillItemType = {
  name: string
  price: number
}

export type BillType = {
  id: string
  amount: number
  dueDate: string
  status: BillStatus
  period: string
  items: BillItemType[]
}

export type BillingHistoryType = {
  id: string
  date: string
  amount: number
  status: BillStatus
  period: string
}
