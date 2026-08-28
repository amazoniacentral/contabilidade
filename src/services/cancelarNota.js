const axios = require('axios');

const cancelarNotaFiscal = async () => {
  try {
    // Chave de acesso de 44 dígitos da nota que você quer cancelar
    const chaveAcesso = "35260800000000000000550010000001231000001234";
    
    // Justificativa do cancelamento (a SEFAZ exige no mínimo 15 caracteres)
    const justificativa = "Erro na digitacao dos dados da venda e valores incorretos";

    const payload = {
      "justificativa": justificativa
    };

    // O endpoint de cancelamento geralmente utiliza o método DELETE ou POST passando a chave na URL
    const response = await axios.delete(`https://api.brasilnfe.com.br/v1/nfe/${chaveAcesso}`, {
      headers: {
        'UserToken': 'SEU_USER_TOKEN_AQUI',
        'Token': 'SEU_TOKEN_DA_EMPRESA_AQUI',
        'Content-Type': 'application/json'
      },
      data: payload // Alguns servidores exigem o payload de justificativa no corpo da requisição DELETE
    });

    console.log("Nota fiscal cancelada com sucesso!", response.data);
  } catch (error) {
    console.error("Erro ao cancelar a nota fiscal:", error.response?.data || error.message);
  }
};

cancelarNotaFiscal();
