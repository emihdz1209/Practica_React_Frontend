import apiClient from '../../../shared/api/apiClient';

export const getTareas = async () => {
  const response = await apiClient.get('/tareas');
  return response.data;
};

export const getTareasByProyecto = async (proyectId) => {
  const response = await apiClient.get(`/tareas/proyecto/${proyectId}`);
  return response.data;
};

export const createTarea = async (tarea) => {
  const response = await apiClient.post('/tareas', tarea);
  return response.data;
};

export const updateTarea = async (taskId, tarea) => {
  const response = await apiClient.put(`/tareas/${taskId}`, tarea);
  return response.data;
};

export const deleteTarea = async (taskId) => {
  await apiClient.delete(`/tareas/${taskId}`);
};
