import axios from 'axios';
import { HOST_BASE_URL, HOST_BASE_PORT } from 'config';

const axiosServices = axios.create({
  baseURL: `${HOST_BASE_URL}:${HOST_BASE_PORT}`,
});

// ==============================|| AXIOS - FOR MOCK SERVICES ||============================== //

axiosServices.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401 && !window.location.href.includes('/login')) {
      window.location.pathname = '/login';
    }
    return Promise.reject((error.response && error.response.data) || 'Wrong Services');
  }
);

export default axiosServices;
