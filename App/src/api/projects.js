import apiClient from './client';
import { ENDPOINTS } from '../utils/constants';

export const projectsApi = {
  getAll: () => apiClient.get(ENDPOINTS.PROJECTS),
  
  getById: (id) => apiClient.get(`${ENDPOINTS.PROJECTS}/${id}`),
  
  create: (projectData) => apiClient.post(ENDPOINTS.PROJECTS, projectData),
  
  update: (id, projectData) => 
    apiClient.put(`${ENDPOINTS.PROJECTS}/${id}`, projectData),
  
  delete: (id) => apiClient.delete(`${ENDPOINTS.PROJECTS}/${id}`),
  
  toggleVisibility: (id) => 
    apiClient.patch(`${ENDPOINTS.PROJECTS}/${id}/visibility`),
  
  reorder: (orderData) => 
    apiClient.post(`${ENDPOINTS.PROJECTS}/reorder`, orderData),
};
