import API from './axios';

export const applyToJob = (jobId, formData) =>
  API.post(`/applications/${jobId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getMyApplications = (params) =>
  API.get('/applications/my', { params });

export const getJobApplications = (jobId, params) =>
  API.get(`/applications/job/${jobId}`, { params });

export const getApplicationById = (id) => API.get(`/applications/${id}`);

export const updateApplicationStatus = (id, data) =>
  API.put(`/applications/${id}/status`, data);

export const updateRecruiterNotes = (id, data) =>
  API.put(`/applications/${id}/notes`, data);