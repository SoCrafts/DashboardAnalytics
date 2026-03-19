import { apiClient } from "@/shared/apiClient";

export const getDatasets = async () => {
  const res = await apiClient.get("/datasets");
  return res.data;
};

export const createDataset = async (data: {
  name: string;
  description: string;
}) => {
  const res = await apiClient.post("/datasets", data);
  return res.data;
};

export const deleteDataset = async (id: string) => {
  await apiClient.delete(`/datasets/${id}`);
};

export const getDataset = async (id: string) => {
  const res = await apiClient.get(`/datasets/${id}`);
  return res.data;
};

export const uploadDataset = async (id: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await apiClient.post(`/datasets/${id}/upload`, formData);
  return res.data;
};

export const getDatasetRows = async (id: string, page = 1, pageSize = 100) => {
  const res = await apiClient.get(`/datasets/${id}/rows`, {
    params: { page, pageSize },
  });
  return res.data;
};
