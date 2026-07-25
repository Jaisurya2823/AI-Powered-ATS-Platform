import API from './axios';

export const analyzeApplication = (applicationId) =>
  API.post(`/ai/analyze/${applicationId}`);

export const bulkAnalyze = (jobId) =>
  API.post(`/ai/bulk-analyze/${jobId}`);

export const getCandidateRankings = (jobId, params) =>
  API.get(`/ai/rankings/${jobId}`, { params });