import apiClient from '../../../shared/api/apiClient';

export const getProyectos = async () => {
  const response = await apiClient.get('/proyectos');
  return response.data;
};

export const createProyecto = async (proyecto) => {
  const response = await apiClient.post('/proyectos', proyecto);
  return response.data;
};
