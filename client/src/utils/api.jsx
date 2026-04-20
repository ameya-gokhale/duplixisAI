import axios from "axios";

const API = axios.create({ baseURL: "/api" });

export const uploadCSV = (file, onUploadProgress) => {
  const fd = new FormData();
  fd.append("file", file);
  return API.post("/upload", fd, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });
};

export const pollJob = (jobId) => API.get(`/jobs/${jobId}`);

export const getRecentJobs = () => API.get("/jobs");

export const downloadCSV = (jobId) => {
  window.open(`/api/jobs/${jobId}/download`, "_blank");
};
