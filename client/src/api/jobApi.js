import API from './axios';

export const getActiveJobs = (params) => API.get('/jobs', { params });
export const getJobById = (id) => API.get(`/jobs/${id}`);
export const getMyJobs = (params) => API.get('/jobs/recruiter/my-jobs', { params });
export const createJob = (data) => API.post('/jobs', data);
export const updateJob = (id, data) => API.put(`/jobs/${id}`, data);
export const archiveJob = (id) => API.delete(`/jobs/${id}`);