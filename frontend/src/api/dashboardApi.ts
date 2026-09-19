import api from '../services/api'

export const dashboardApi = {
  getSummary: () => api.get('/admin/dashboard'),
}
