import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const api = axios.create({
    baseURL: BASE_URL,
    timeout: 5000,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        const at = localStorage.getItem("at_biogeles");
        if (at) {
        config.headers.Authorization = `Bearer ${at}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);