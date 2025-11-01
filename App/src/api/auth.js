import apiClient from './client';
import { ENDPOINTS } from '../utils/constants';

export const authApi = {
  login: (credentials) => apiClient.post(ENDPOINTS.AUTH.LOGIN, credentials),
  
  register: (userData) => apiClient.post(ENDPOINTS.AUTH.REGISTER, userData),
  
  changePassword: (passwordData) => 
    apiClient.post(ENDPOINTS.AUTH.CHANGE_PASSWORD, passwordData),
};
