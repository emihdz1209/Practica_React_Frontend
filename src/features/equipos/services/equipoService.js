import apiClient from '../../../shared/api/apiClient';

export const getEquipos = async () => {
  const response = await apiClient.get('/equipos');
  return response.data;
};

export const createEquipo = async (equipo) => {
  const response = await apiClient.post('/equipos', equipo);
  return response.data;
};
