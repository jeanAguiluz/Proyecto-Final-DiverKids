import axios from 'axios';

// Configuración de Axios
const axiosInstance = axios.create({
    baseURL: 'http://localhost:5175',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Añadir token JWT a las cabeceras de las solicitudes
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default axiosInstance;
