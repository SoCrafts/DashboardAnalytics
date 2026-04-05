import { apiClient } from "@/shared/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ── Shared primitive types ────────────────────────────────────────────────────

export interface DatasetColumn {
  name: string;
  dataType: string;
}

/** A single data row: keys are column names, values are the stored cell values. */
export interface DatasetRow {
  [key: string]: string | number | boolean | null;
}

// ── API response types ────────────────────────────────────────────────────────

export interface Dataset {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  rowCount: number;
  status: "Empty" | "Ready";
  hasData: boolean;
  columns: DatasetColumn[];
}

export interface DatasetRowsResult {
  columns: DatasetColumn[];
  rows: DatasetRow[];
  totalRows: number;
  page: number;
  pageSize: number;
}

export interface PreviewResult {
  columns: DatasetColumn[];
  rows: DatasetRow[];
}

export interface Metric {
  column: string;
  sum: number;
  avg: number;
  count: number;
}

export interface CategoryData {
  name: string;
  count: number;
}

export interface DistributionData {
  range: string;
  count: number;
}

export interface TrendData {
  date: string;
  value: number;
}

export interface SummaryData {
  min: number;
  max: number;
  avg: number;
  median: number;
}

export interface DatasetInsights {
  categorical:   Record<string, CategoryData[]>;
  distributions: Record<string, DistributionData[]>;
  trends:        Record<string, TrendData[]>;
  summary:       Record<string, SummaryData>;
}

export interface UploadResult {
  message: string;
  rowsInserted: number;
  columnsDetected: number;
}

// ── Fetcher functions ─────────────────────────────────────────────────────────

export const getDatasets = (): Promise<Dataset[]> =>
  apiClient.get<Dataset[]>("/datasets").then(r => r.data);

export const getDataset = (id: string): Promise<Dataset> =>
  apiClient.get<Dataset>(`/datasets/${id}`).then(r => r.data);

export const getDatasetRows = (id: string, page = 1, pageSize = 10): Promise<DatasetRowsResult> =>
  apiClient.get<DatasetRowsResult>(`/datasets/${id}/rows`, { params: { page, pageSize } })
    .then(r => r.data);

export const getDatasetMetrics = (id: string): Promise<Metric[]> =>
  apiClient.get<Metric[]>(`/datasets/${id}/metrics`).then(r => r.data);

export const getDatasetInsights = (id: string): Promise<DatasetInsights> =>
  apiClient.get<DatasetInsights>(`/datasets/${id}/insights`).then(r => r.data);

// ── React Query hooks ─────────────────────────────────────────────────────────

export const useDatasets = () =>
  useQuery({ queryKey: ["datasets"], queryFn: getDatasets });

export const useDataset = (id: string) =>
  useQuery({ queryKey: ["datasets", id], queryFn: () => getDataset(id), enabled: !!id });

export const useDatasetRows = (id: string, page: number, pageSize: number) =>
  useQuery({
    queryKey: ["datasets", id, "rows", { page, pageSize }],
    queryFn:  () => getDatasetRows(id, page, pageSize),
    enabled:  !!id,
  });

export const useDatasetMetrics = (id: string) =>
  useQuery({
    queryKey: ["datasets", id, "metrics"],
    queryFn:  () => getDatasetMetrics(id),
    enabled:  !!id,
  });

export const useDatasetInsights = (id: string) =>
  useQuery({
    queryKey: ["datasets", id, "insights"],
    queryFn:  () => getDatasetInsights(id),
    enabled:  !!id,
  });

export const useUploadDataset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => {
      const formData = new FormData();
      formData.append("file", file);
      return apiClient.post<UploadResult>(`/datasets/${id}/upload`, formData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["datasets", variables.id] });
    },
  });
};

export const usePreviewDataset = () =>
  useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => {
      const formData = new FormData();
      formData.append("file", file);
      return apiClient.post<PreviewResult>(`/datasets/${id}/preview`, formData);
    },
  });

export const useCreateDataset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description: string }) =>
      apiClient.post<Dataset>("/datasets", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["datasets"] }),
  });
};

export const useDeleteDataset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/datasets/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["datasets"] }),
  });
};
