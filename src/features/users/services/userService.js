import apiClient from '../../../shared/api/apiClient';

export const getUsers = async () => {
  const response = await apiClient.get('/users');
  return response.data;
};

export const createUser = async (user) => {
  const response = await apiClient.post('/users', user);
  return response.data;
};
