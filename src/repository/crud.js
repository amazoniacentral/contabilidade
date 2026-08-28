const axios = require('axios');

const post = async ({ userToken, token }, payload ) => {
  const response = await axios.post('https://api.brasilnfe.com.br/v1/nfe', payload, {
    headers: {
      'UserToken': userToken,
      'Token': token,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};

const post = async ({ userToken, token }, chaveAcesso ) => {
  const response = await axios.delete(`https://api.brasilnfe.com.br/v1/nfe/${chaveAcesso}`, {
    headers: {
      'UserToken': userToken,
      'Token': token,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};
