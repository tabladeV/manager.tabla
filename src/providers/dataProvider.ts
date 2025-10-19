import { DataProvider, CrudFilters, CrudSorting, Pagination } from "@refinedev/core";
import { httpClient } from "../services/httpClient";

/**
 * Builds query parameters for list requests
 */
const buildQueryParams = (
  pagination?: Pagination, 
  sorters?: CrudSorting, 
  filters?: CrudFilters
): Record<string, string> => {
  const query: Record<string, string> = {};

  // Handle pagination
  if (pagination?.current && pagination?.pageSize) {
    query._start = String((pagination.current - 1) * pagination.pageSize);
    query._end = String(pagination.current * pagination.pageSize);
  }

  // Handle sorting
  if (sorters && sorters.length > 0) {
    query._sort = String(sorters[0].field);
    query._order = String(sorters[0].order);
  }

  // Handle filters
  if (filters) {
    filters.forEach((filter) => {
      if (filter.operator === "eq") {
        query[filter.field] = String(filter.value);
      }
    });
  }

  return query;
};

/**
 * Extracts total count from response headers
 */
const extractTotalCount = (headers: Record<string, string>, dataLength: number): number => {
  const totalHeader = headers["x-total-count"] || headers["X-Total-Count"];
  return totalHeader ? parseInt(totalHeader, 10) : dataLength;
};

/**
 * Enhanced data provider that works across all platforms
 * Uses the unified HTTP client for consistent behavior
 */
const createDataProvider = (apiUrl: string): DataProvider => ({
  getList: async ({ resource, pagination, filters, sorters }) => {
    const url = `${apiUrl}/${resource}`;
    const query = buildQueryParams(pagination, sorters, filters);
    
    const queryString = new URLSearchParams(query).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;

    const response = await httpClient.get(fullUrl);

    return {
      data: response.data,
      total: extractTotalCount(response.headers, response.data.length),
    };
  },

  getOne: async ({ resource, id }) => {
    const url = `${apiUrl}/${resource}/${id}`;
    const response = await httpClient.get(url);

    return {
      data: response.data,
    };
  },

  create: async ({ resource, variables }) => {
    const url = `${apiUrl}/${resource}`;
    const response = await httpClient.post(url, variables);

    return {
      data: response.data,
    };
  },

  update: async ({ resource, id, variables }) => {
    const url = `${apiUrl}/${resource}/${id}`;
    const response = await httpClient.patch(url, variables);

    return {
      data: response.data,
    };
  },

  deleteOne: async ({ resource, id }) => {
    const url = `${apiUrl}/${resource}/${id}`;
    const response = await httpClient.delete(url);

    return {
      data: response.data,
    };
  },

  getApiUrl: () => apiUrl,

  custom: async ({ url, method, payload, query, headers }) => {
    let requestUrl = `${url}`;

    if (query) {
      const queryString = new URLSearchParams(query).toString();
      requestUrl = `${requestUrl}?${queryString}`;
    }

    const response = await httpClient.request({
      url: requestUrl,
      method: method.toUpperCase() as any,
      data: payload,
      headers
    });

    return {
      data: response.data,
    };
  },
});

export default createDataProvider;
