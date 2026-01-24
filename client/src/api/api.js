import axios from "axios";

const api = axios.create({
  baseURL: "https://travelmint-backend.onrender.com/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🔮 AI Trip Planner
export const planTripWithAI = (data) => {
  return api.post("/ai/plan-trip", data);
};


export default api;
