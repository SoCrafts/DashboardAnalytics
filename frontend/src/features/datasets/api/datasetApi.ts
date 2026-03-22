import { apiClient } from "@/shared/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Types
export interface Dataset {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  rowCount: number;
  status: "Empty" | "Ready";
  hasData: boolean;
  columns: { name: string; dataType: string }[];
}

export interface DatasetRow {
  [key: string]: { value: any; raw: string | null };
}

export interface Metric {
  name: string;
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
  categorical: Record<string, CategoryData[]>;
  distributions: Record<string, DistributionData[]>;
  trends: Record<string, TrendData[]>;
  summary: Record<string, SummaryData>;
}

// Fetchers
export const getDatasets = async (): Promise<Dataset[]> => {
  const res = await apiClient.get("/datasets");
  return res.data;
};

export const getDataset = async (id: string): Promise<Dataset> => {
  const res = await apiClient.get(`/datasets/${id}`);
  return res.data;
};

export const getDatasetRows = async (id: string, page = 1, pageSize = 10) => {
  const res = await apiClient.get(`/datasets/${id}/rows`, {
    params: { page, pageSize },
  });
  return res.data;
};

export const getDatasetMetrics = async (id: string): Promise<{ columns: Metric[] }> => {
  const res = await apiClient.get(`/datasets/${id}/metrics`);
  return res.data;
};

export const getDatasetInsights = async (id: string): Promise<DatasetInsights> => {
  const res = await apiClient.get(`/datasets/${id}/insights`);
  return res.data;
};

// Hooks
export const useDatasets = () => useQuery({ queryKey: ["datasets"], queryFn: getDatasets });

export const useDataset = (id: string) => 
  useQuery({ queryKey: ["datasets", id], queryFn: () => getDataset(id), enabled: !!id });

export const useDatasetRows = (id: string, page: number, pageSize: number) => 
  useQuery({ 
    queryKey: ["datasets", id, "rows", { page, pageSize }], 
    queryFn: () => getDatasetRows(id, page, pageSize),
    enabled: !!id 
  });

export const useDatasetMetrics = (id: string) => 
  useQuery({ queryKey: ["datasets", id, "metrics"], queryFn: () => getDatasetMetrics(id), enabled: !!id });

export const useDatasetInsights = (id: string) => 
  useQuery({ queryKey: ["datasets", id, "insights"], queryFn: () => getDatasetInsights(id), enabled: !!id });

export const useUploadDataset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => {
      const formData = new FormData();
      formData.append("file", file);
      return apiClient.post(`/datasets/${id}/upload`, formData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["datasets", variables.id] });
    }
  });
};

export const usePreviewDataset = () => {
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => {
      const formData = new FormData();
      formData.append("file", file);
      return apiClient.post(`/datasets/${id}/preview`, formData);
    }
  });
};

export const useCreateDataset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description: string }) => apiClient.post("/datasets", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["datasets"] })
  });
};

export const useDeleteDataset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/datasets/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["datasets"] })
  });
};
