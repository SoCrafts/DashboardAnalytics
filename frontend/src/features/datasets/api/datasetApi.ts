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
