const axios = require('axios');

const emitirNotaBaixaMostruario = async (regimeEmpresa = 'SIMPLES') => {
  try {
    const regime = regimeEmpresa.toUpperCase();
    let icmsProduto = { "origem": 0 };

    if (regime === 'NORMAL') {
      icmsProduto.cst = "90"; // Outros para Regime Normal (comum em baixa/estorno, confirme com o contador)
    } else {
      icmsProduto.csosn = "900"; // Outros para Simples Nacional/MEI (comum em baixa, confirme com o contador)
    }

    const payload = {
      "natureza_operacao": "Baixa de estoque para uso como mostruario",
      "modelo": "55",
      "finalidade": 1,
      "ambiente": 2, // 2 para Homologação (Testes) | 1 para Produção
      // No caso de consumo/baixa interna, o destinatário é a própria empresa emitente
      "cliente": {
        "cpf_cnpj": "SEU_CNPJ_AQUI", // O CNPJ da sua própria empresa
        "razao_social": "SUA EMPRESA LTDA",
        "inscricao_estadual": "SUA_inscricao_ESTADUAL",
        "email": "contato@suaempresa.com",
        "endereco": {
          "logradouro": "Rua da sua empresa",
          "numero": "123",
          "bairro": "Centro",
          "municipio": "São Paulo",
          "uf": "SP",
          "cep": "01001000"
        }
      },
      "produtos": [
        {
          "codigo": "PERFUME01",
          "descricao": "Perfume utilizado como Provador / Mostruário",
          "ncm": "33030010", // Exemplo de NCM de perfumaria
          "cfop": "5927", // Lançamento efetuado a título de baixa de estoque (confirme com o contador)
          "unidade": "UN",
          "quantidade": 1.0000,
          "valor_unitario": 100.00,
          "valor_total": 100.00,
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

    console.log(`Nota de baixa emitida com sucesso (${regime})!`, response.data);
  } catch (error) {
    console.error("Erro ao emitir nota de baixa:", error.response?.data || error.message);
  }
};

emitirNotaBaixaMostruario('SIMPLES');
