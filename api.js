// api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://176.119.254.225:80', // Your backend URL
});

export default api;
