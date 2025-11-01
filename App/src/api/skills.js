import apiClient from './client';
import { ENDPOINTS } from '../utils/constants';

export const skillsApi = {
  getAll: () => apiClient.get(ENDPOINTS.SKILLS),
  
  create: (skillData) => apiClient.post(ENDPOINTS.SKILLS, skillData),
  
  update: (id, skillData) => apiClient.put(`${ENDPOINTS.SKILLS}/${id}`, skillData),
  
  delete: (id) => apiClient.delete(`${ENDPOINTS.SKILLS}/${id}`),
  
  reorder: (orderData) => apiClient.post(`${ENDPOINTS.SKILLS}/reorder`, orderData),
};
