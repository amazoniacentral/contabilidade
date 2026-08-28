const axios = require('axios');

const chamarApi = async ({ userToken, token, payload }) => {
  const response = await axios.post('https://api.brasilnfe.com.br/v1/nfe', payload, {
    headers: {
      'UserToken': userToken,
      'Token': token,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};
