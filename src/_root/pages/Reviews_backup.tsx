"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import SearchBar from "../../components/header/SearchBar"
import { format } from "date-fns"
import IntervalCalendar from "../../components/Calendar/IntervalCalendar"
import { type BaseKey, type BaseRecord, useList } from "@refinedev/core"
import Pagination from "../../components/reservation/Pagination"
import ExportModal from "../../components/common/ExportModal"
import useExportConfig from "../../components/common/config/exportConfig"
import axiosInstance from "../../providers/axiosInstance"
import { saveAs } from "file-saver"
import { useAsyncTaskManager } from "../../hooks/useAsyncTaskManager"

interface Review {
  id: BaseKey
  food_rating?: string | null
  value_for_money?: string | null
  service_rating?: string | null
  ambience_rating?: string | null
  created_at: string
  description?: string | null
  customer?: {
    id?: number
    first_name?: string | null
    last_name?: string | null
    email?: string | null
    phone?: string | null
  } | null
  source?: string | null
}

const Reviews = () => {
  const { t } = useTranslation()

  useEffect(() => {
    document.title = "Reviews | Tabla"
  }, [])

  const [page, setPage] = useState(1)
  const [count, setCount] = useState(0)
  const [size, setSize] = useState(10)

  const [reviews, setReviews] = useState<Review[]>([])

  const [searchKeyword, setSearchKeyword] = useState("")
  const [showExportModal, setShowExportModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const { reviews: reviewsExportConfig } = useExportConfig()
  const { startTask, AsyncTaskManager } = useAsyncTaskManager()

  const handleExport = async (format: 'sheet' | 'pdf', selectedColumns: string[], customValues: Record<string, any>, pdfEngine?: 'xhtml2pdf' | 'reportlab') => {
    const {
      created_at__gte,
      created_at__lte,
      ratings,
      includeRatingStats,
      async: asyncGeneration,
      email
    } = customValues

    const requestBody: any = {
      format,
      selected_columns: selectedColumns,
      async_generation: asyncGeneration,
      async: asyncGeneration,
      customOptions: {
        includeRatingStats: !!includeRatingStats,
      },
      pdf_engine: pdfEngine,
    }

    if (created_at__gte) requestBody.created_at__gte = created_at__gte
    if (created_at__lte) requestBody.created_at__lte = created_at__lte
    // if (ratings && ratings.length > 0) requestBody.ratings = ratings // has issues
    if (searchKeyword) requestBody.search = searchKeyword
    if (asyncGeneration && email) requestBody.email = email

    try {
      setLoading(true)
      const response = await axiosInstance.post('/api/v1/bo/reports/reviews/', requestBody, {
        responseType: asyncGeneration ? 'json' : 'blob',
      })

      if (asyncGeneration) {
        const { task_id } = response.data
        if (email) {
          alert(`Report generation started. You will be notified by email at ${email}. Task ID: ${task_id}`)
        } else {
          startTask(task_id)
        }
      } else {
        const blob = new Blob([response.data], { type: response.headers['content-type'] })
        const filename = `reviews_export.${format === 'sheet' ? 'xlsx' : 'pdf'}`
        saveAs(blob, filename)
      }
      setShowExportModal(false)
    } catch (error) {
      console.error("Export failed:", error)
      alert("Failed to export data. Please check the console for details.")
    } finally {
      setLoading(false)
    }
  }
  // const {reviews: reviewsExportConfig} = useAdvancedExportConfig();

  const searchFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keyword = e.target.value.toLowerCase()
    setSearchKeyword(keyword)
  }

  interface ReviewsType {
    results: BaseRecord[]
    count: number
  }

  const [reviewsAPIInfo, setReviewsAPIInfo] = useState<ReviewsType>()
  const [selectedDateRange, setSelectedDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  })

  const { data, isLoading, error } = useList({
    resource: "api/v1/reviews/",
    filters: [
      {
        field: "search",
        operator: "eq",
        value: searchKeyword,
      },
      {
        field: "created_at_",
        operator: "gte",
        value: selectedDateRange.start ? format(selectedDateRange.start, "yyyy-MM-dd") : "",
      },
      {
        field: "created_at_",
        operator: "lte",
        value: selectedDateRange.end ? format(selectedDateRange.end, "yyyy-MM-dd") : "",
      },
      {
        field: "page",
        operator: "eq",
        value: page,
      },
      {
        field: "page_size",
        operator: "eq",
        value: size,
      },
      {
        field: "ordering",
        operator: "eq",
        value: "id",
      },
    ],
    queryOptions: {
      onSuccess: (data) => {
        setReviewsAPIInfo(data.data as unknown as ReviewsType)
      },
    },
  })

  useEffect(() => {
    if (reviewsAPIInfo) {
      setReviews(reviewsAPIInfo.results as Review[])
      setCount(reviewsAPIInfo.count)
    }
  }, [reviewsAPIInfo])

  const avg = (a: string | number | null | undefined, b: string | number | null | undefined, c: string | number | null | undefined, d: string | number | null | undefined) => {
    const numA = Number(a) || 0
    const numB = Number(b) || 0
    const numC = Number(c) || 0
    const numD = Number(d) || 0
    return ((numA + numB + numC + numD) / 4).toFixed(2)
  }

  const [focusedFilter, setFocusedFilter] = useState("")
  const [selectingDay, setSelectingDay] = useState("")
  const [focusedDate, setFocusedDate] = useState(false)
  const [searchResults, setSearchResults] = useState<Review[]>([])
  const [focusReview, setFocusReview] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState<BaseKey>(0)
  const [selectedReview, setSelectedReview] = useState<Review>()

  useEffect(() => {
    if (selectedClient !== "") {
      const review = (reviews as Review[]).find((review: Review) => review.id === selectedClient)
      if (review) {
        setSelectedReview(review)
      }
    }
  }, [selectedClient])

  const handleDateClick = (range: { start: Date; end: Date }) => {
    setSelectedDateRange(range)
  }

  useEffect(() => {
    if (selectedDateRange.start && selectedDateRange.end) {
      const formattedStart = format(selectedDateRange.start, "dd/MM/yyyy")
      const formattedEnd = format(selectedDateRange.end, "dd/MM/yyyy")
      setSelectingDay(`${formattedStart} - ${formattedEnd}`)
    } else if (selectedDateRange.start) {
      setSelectingDay(format(selectedDateRange.start, "dd/MM/yyyy"))
    } else {
      setSelectingDay("")
    }
  }, [selectedDateRange])

  const setDefaultFilter = () => {
    setFocusedFilter("")
    setSelectingDay("")
    setSelectedDateRange({ start: null, end: null })
  }

  let filteredReviews = reviews as Review[]

  useEffect(() => {
    if (searchResults.length === 0) {
      setSearchResults(reviews as Review[])
    }
  }, [reviews])

  filteredReviews = searchResults?.filter((reservation: Review) => {
    if (focusedFilter !== "") return false
    if (selectedDateRange.start && selectedDateRange.end && reservation.created_at) {
      try {
        const reservationDate = reservation.created_at.slice(0, 10)
        const reservationDateObj = new Date(reservationDate)
        return reservationDateObj >= selectedDateRange.start && reservationDateObj <= selectedDateRange.end
      } catch (error) {
        console.warn('Invalid date format:', reservation.created_at)
        return false
      }
    }
    return true
  }) || []

  const stars = (rating: number) => {
    rating = Math.round(rating)
    let number = ""
    for (let i = 0; i < rating; i++) {
      number += "⭐"
    }
    return number
  }

  return (
    <div>
      <AsyncTaskManager />
      {showExportModal && (
        <ExportModal
          title="Export Reviews"
          columns={reviewsExportConfig.columns}
          customFields={reviewsExportConfig.customFields}
          onExport={handleExport}
          onClose={() => setShowExportModal(false)}
          loading={loading}
        />
      )}
      {selectedClient !== 0 && (
        <div>
          <div className="overlay" onClick={() => setSelectedClient(0)}></div>
          <div
            className={`sidepopup lt-sm:w-full lt-sm:h-[70vh] lt-sm:bottom-0 lt-sm:overflow-y-auto h-full bg-white dark:bg-bgdarktheme`}
          >
            <h1 className="text-2xl font-[600] mb-4">
              {t("reviews.view.title")} by{" "}
              <span className="font-[800]">
                {selectedReview?.customer?.first_name || 'Unknown'} {selectedReview?.customer?.last_name || 'User'}
              </span>
            </h1>
            <div className="space-y-2">
              <div>
                <div className="font-[600] mb-[.4em]">{t("reviews.view.comment")}:</div>
                {selectedReview && (
                  <p className={`p-2 border-[2px] rounded-md border-black dark:border-darkthemeitems`}>
                    {selectedReview.description || t("reviews.view.noComment")}
                  </p>
                )}

                {selectedReview && (
                  <>
                    <div className="flex mt-4 gap-4">
                      <div className="font-[600]">{t("reviews.view.food")}:</div>
                      {stars(Number(selectedReview.food_rating) || 0)}
                      <span>{`(${selectedReview.food_rating || 'N/A'})`}</span>
                    </div>
                    <div className="flex mt-4 gap-4">
                      <div className="font-[600]">{t("reviews.view.service")}:</div>
                      {stars(Number(selectedReview.service_rating) || 0)}
                      <span>{`(${selectedReview.service_rating || 'N/A'})`}</span>
                    </div>
                    <div className="flex mt-4 gap-4">
                      <div className="font-[600]">{t("reviews.view.environment")}:</div>
                      {stars(Number(selectedReview.ambience_rating) || 0)}
                      <span>{`(${selectedReview.ambience_rating || 'N/A'})`}</span>
                    </div>
                    <div className="flex mt-4 gap-4">
                      <div className="font-[600]">{t("reviews.view.valueForMoney")}:</div>
                      {stars(Number(selectedReview.value_for_money) || 0)}
                      <span>{`(${selectedReview.value_for_money || 'N/A'})`}</span>
                    </div>

                    <div className="flex mt-4 gap-4">
                      <div className="font-[600]">{t("reviews.view.total")}:</div>
                      {stars(
                        (Number(selectedReview.ambience_rating) +
                          Number(selectedReview.service_rating) +
                          Number(selectedReview.food_rating) +
                          Number(selectedReview.value_for_money)) /
                          4,
                      )}
                      <span>{`(${(
                        (Number(selectedReview.ambience_rating) +
                          Number(selectedReview.service_rating) +
                          Number(selectedReview.food_rating) +
                          Number(selectedReview.value_for_money)) /
                          4
                      ).toFixed(2)})`}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center mb-2">
        <h1>{t("reviews.title")}</h1>
        <button onClick={() => setShowExportModal(true)} className={`dark:text-whitetheme btn-primary`}>
          {/* {t('reviews.filters.all')} */}
          {t("reviews.buttons.export")}
        </button>
      </div>
      <div className="flex lt-sm:flex-col lt-sm:gap-2 justify-between">
        <div className="">
          <SearchBar SearchHandler={searchFilter} />
        </div>
        <div className="flex lt-sm:flex-wrap gap-4">
          <button
            className={`gap-2 flex items-center dark:text-whitetheme ${selectingDay === "" ? "btn" : "btn-primary"}`}
            onClick={() => setFocusedDate(true)}
          >
            {t("reviews.filters.date")}
          </button>
          <button
            onClick={setDefaultFilter}
            className={`dark:text-whitetheme ${focusedFilter === "" && selectingDay === "" ? "btn-primary" : "btn"}`}
          >
            {t("reviews.filters.all")}
          </button>
        </div>
      </div>
      <div>
        <table className={`min-w-full divide-y divide-gray-200 dark:divide-gray-800`}>
          <thead className={`bg-gray-50 text-gray-500 dark:bg-bgdarktheme2 dark:text-white`}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                {t("reviews.tableHeaders.id")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                {t("reviews.tableHeaders.name")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                {t("reviews.tableHeaders.comment")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                {t("reviews.tableHeaders.food")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                {t("reviews.tableHeaders.service")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                {t("reviews.tableHeaders.environment")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                {t("reviews.tableHeaders.valueForMoney")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                {t("reviews.tableHeaders.total")}
              </th>
            </tr>
          </thead>
          <tbody className={`bg-gray-50 text-gray-500 dark:bg-bgdarktheme2 dark:text-white`}>
            {isLoading
              ? Array.from({ length: size }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`h-4 rounded w-3/4 bg-gray-300 dark:bg-darkthemeitems`}></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`h-4 rounded w-3/4 bg-gray-300 dark:bg-darkthemeitems`}></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`h-4 rounded w-full bg-gray-300 dark:bg-darkthemeitems`}></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`h-4 rounded w-1/2 bg-gray-300 dark:bg-darkthemeitems`}></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`h-4 rounded w-1/2 bg-gray-300 dark:bg-darkthemeitems`}></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`h-4 rounded w-1/2 bg-gray-300 dark:bg-darkthemeitems`}></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`h-4 rounded w-1/2 bg-gray-300 dark:bg-darkthemeitems`}></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`h-4 rounded w-1/2 bg-gray-300 dark:bg-darkthemeitems`}></div>
                    </td>
                  </tr>
                ))
              : (reviews || []).map((review) => (
                  <tr key={review.id} className="hover:opacity-75">
                    <td
                      className="px-6 py-4 whitespace-nowrap cursor-pointer"
                      onClick={() => setSelectedClient(review.id)}
                    >
                      {review.id||'N/A'}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap cursor-pointer"
                      onClick={() => setSelectedClient(review.id)}
                    >
                      {review.customer?.first_name || 'Unknown'} {review.customer?.last_name || 'User'}
                    </td>
                    <td
                      className="px-6 py-4 max-w-[20em] whitespace-nowrap cursor-pointer"
                      onClick={() => setSelectedClient(review.id)}
                    >
                      {review.description && review.description.length > 50
                        ? `${review.description.substring(0, 40)}...`
                        : review.description || 'No comment'}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap cursor-pointer"
                      onClick={() => setSelectedClient(review.id)}
                    >
                      {review.food_rating || 'No rating'}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap cursor-pointer"
                      onClick={() => setSelectedClient(review.id)}
                    >
                      {review.service_rating || 'No rating'}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap cursor-pointer"
                      onClick={() => setSelectedClient(review.id)}
                    >
                      {review.ambience_rating || 'No rating'}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap cursor-pointer"
                      onClick={() => setSelectedClient(review.id)}
                    >
                      {review.value_for_money || 'No rating'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" onClick={() => setSelectedClient(review.id)}>
                      {avg(
                        review.food_rating,
                        review.service_rating,
                        review.ambience_rating,
                        review.value_for_money,
                      )}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        <Pagination
          setPage={(page: number) => {
            setPage(page)
          }}
          page={page}
          size={size}
          count={count}
        />
      </div>
      {focusedDate && (
        <div>
          <div className="overlay" onClick={() => setFocusedDate(false)}></div>
          <div className={`popup lt-sm:w-full lt-sm:h-[70vh] lt-sm:bottom-0 bg-white dark:bg-bgdarktheme`}>
            <IntervalCalendar onRangeSelect={handleDateClick} onClose={() => setFocusedDate(false)} />
          </div>
        </div>
      )}
    </div>
  )
}

export default Reviews
