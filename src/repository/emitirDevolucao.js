const axios = require('axios');

const emitirNotaDevolucao = async (regimeEmpresa = 'SIMPLES') => {
  try {
    const regime = regimeEmpresa.toUpperCase();
    let icmsProduto = { "origem": 0 };

    if (regime === 'NORMAL') {
      icmsProduto.cst = "00"; // Ajuste conforme a tributação original da venda
    } else {
      icmsProduto.csosn = "102"; // Ajuste conforme a tributação original da venda
    }

    const payload = {
      "natureza_operacao": "Devolução de venda de mercadoria",
      "modelo": "55",
      "finalidade": 4, // 4 para NF-e de devolução/retorno
      "ambiente": 2, // 2 para Homologação (Testes) | 1 para Produção
      
      // Chave de acesso da nota fiscal original que está sendo devolvida (44 dígitos)
      "nfe_referenciada": "35260800000000000000550010000001231000001234", 

      "cliente": {
        "cpf_cnpj": "12345678000199", // CNPJ ou CPF do cliente que está devolvendo
        "razao_social": "Cliente Exemplo LTDA",
        "inscricao_estadual": "123456789",
        "email": "financeiro@cliente.com",
        "endereco": {
          "logradouro": "Avenida Paulista",
          "numero": "1000",
          "bairro": "Bela Vista",
          "municipio": "São Paulo",
          "uf": "SP",
          "cep": "01310100"
        }
      },
      "produtos": [
        {
          "codigo": "PROD02",
          "descricao": "Produto devolvido pelo cliente",
          "ncm": "94032000",
          "cfop": "1202", // 1202 para devolução de venda dentro do estado (ou 2202 para fora)
          "unidade": "UN",
          "quantidade": 1.0000,
          "valor_unitario": 40.00,
          "valor_total": 40.00,
          "icms": icmsProduto
        }
      ]
    };

    const response = await axios.post('https://api.brasilnfe.com.br/v1/nfe', payload, {
      headers: {
        'UserToken': 'SEU_USER_TOKEN_AQUI',
        'Token': 'SEU_TOKEN_DA_EMPRESA_AQUI',
        'Content-Type': 'application/json'
      }
    });

    console.log(`Nota de devolução emitida com sucesso (${regime})!`, response.data);
  } catch (error) {
    console.error("Erro ao emitir nota de devolução:", error.response?.data || error.message);
  }
};

emitirNotaDevolucao('SIMPLES');
