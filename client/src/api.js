import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

export const uploadFile = (file, onProgress) => {
  const formData = new FormData();
  formData.append("file", file);

  return api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (evt) => {
      if (onProgress && evt.total) {
        onProgress(Math.round((evt.loaded * 100) / evt.total));
      }
    },
  });
};

export const verifyCode = (code) => api.get(`/verify/${code}`);

export const downloadByCode = (code) => `/api/download/code/${code}`;

export default api;
