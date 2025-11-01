import apiClient from './client';
import { ENDPOINTS } from '../utils/constants';

export const profileApi = {
  get: () => apiClient.get(ENDPOINTS.PROFILE),
  
  update: (data) => apiClient.put(ENDPOINTS.PROFILE, data),
  
  uploadImage: (formData, type) => 
    apiClient.post(`${ENDPOINTS.PROFILE}/upload/${type}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  deleteImage: (type) => apiClient.delete(`${ENDPOINTS.PROFILE}/image/${type}`),
};
