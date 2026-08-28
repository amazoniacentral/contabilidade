const axios = require('axios');

const setProtocolo = (host) => {
  if (!host) return host;
  if (host.startsWith('http://') || host.startsWith('https://')) {
    return host;
  }
  return `http://${host}`;
};

const baseURL = setProtocolo(process.env.API_HOST || `django:8000`);

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

module.exports = api;