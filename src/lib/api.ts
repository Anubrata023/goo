import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Submit text complaint
export const submitTextComplaint = async (data: {
  text: string;
  ward: string;
  phone?: string;
}) => {
  const response = await api.post('/api/complaints/submit', data);
  return response.data;
};

// Submit voice complaint
export const submitVoiceComplaint = async (audioFile: File, ward: string) => {
  const formData = new FormData();
  formData.append('file', audioFile);
  formData.append('ward', ward);
  const response = await api.post('/api/complaints/voice', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Submit photo complaint
export const submitPhotoComplaint = async (imageFile: File, ward: string) => {
  const formData = new FormData();
  formData.append('file', imageFile);
  formData.append('ward', ward);
  const response = await api.post('/api/complaints/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Generate proposal
export const generateProposal = async (complaintId: string) => {
  const response = await api.post(`/api/complaints/${complaintId}/draft`);
  return response.data;
};

// Get all complaints (for admin)
export const getComplaints = async () => {
  const response = await api.get('/api/complaints');
  return response.data;
};

// Update complaint status (Kanban)
export const updateComplaintStatus = async (complaintId: string, status: string) => {
  const response = await api.patch(`/api/complaints/${complaintId}/status`, { status });
  return response.data;
};
