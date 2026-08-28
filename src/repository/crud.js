const axios = require('axios');

const postar = async ({ userToken, token }, payload ) => {
  const response = await axios.post('https://api.brasilnfe.com.br/v1/nfe', payload, {
    headers: {
      'UserToken': userToken,
      'Token': token,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};

const cancelar = async ({ userToken, token }, chaveAcesso, justificativa ) => {
  const payload = {
    "justificativa": justificativa
  };
  
  const response = await axios.delete(`https://api.brasilnfe.com.br/v1/nfe/${chaveAcesso}`, {
    headers: {
      'UserToken': userToken,
      'Token': token,
      'Content-Type': 'application/json'
    },
    data: payload // Alguns servidores exigem o payload de justificativa no corpo da requisição DELETE
  });
  return response.data;
};

module.exports = { postar, cancelar };
