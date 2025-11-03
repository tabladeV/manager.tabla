import { useOne, type BaseRecord } from "@refinedev/core";

/**
 * Custom hook to fetch public widget data for the current subdomain.
 * It centralizes the data fetching logic, including loading and error states.
 *
 * @returns An object containing:
 *  - `widgetInfo`: The widget data.
 *  - `isLoading`: Boolean indicating if the data is being loaded.
 *  - `error`: The error object if the request fails.
 */
export const useWidgetData = (): { widgetInfo?: BaseRecord; isLoading: boolean; error: any } => {
    const { data, isLoading, error } = useOne({
        resource: `api/v1/bo/subdomains/public/cutomer/reservations`,
        id: "",
    });

    return { widgetInfo: data?.data, isLoading, error };
};