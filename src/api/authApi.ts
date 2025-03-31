import axios from "axios";

const API_BASE_URL = "http://localhost:8080/identity";
// axios.defaults.withCredentials = true;
export const login = async (username: string, password: string) => {
  const response = await axios.post(`${API_BASE_URL}/auth/token`, {
    username,
    password,
  });
  return response.data;
};

export const register = async (username: string, password: string) => {
  const response = await axios.post(`${API_BASE_URL}/users`, {
    username,
    password,
  });
  return response.data;
};
