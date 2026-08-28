const axios = require('axios');

const emitirNotaFiscal = async (regimeEmpresa = 'SIMPLES') => {
  try {
    const regime = regimeEmpresa.toUpperCase();
    
    let icmsProduto1 = { "origem": 0 };
    let icmsProduto2 = { "origem": 0 };

    if (regime === 'NORMAL') {
      icmsProduto1.cst = "60";
      icmsProduto2.cst = "00";
      icmsProduto2.p_icms = 18.00;
    } else {
      icmsProduto1.csosn = "500";
      icmsProduto2.csosn = "102";
    }

    const payload = {
      "natureza_operacao": "Venda de mercadorias",
      "modelo": "65",
      "finalidade": 1,
      "ambiente": 2,
      "cliente": {
        "cpf_cnpj": "12345678909",
        "razao_social": "Nome Completo do Cliente"
      },
      "produtos": [
        {
          "codigo": "PROD01",
          "descricao": "Produto com Imposto já pago (ST)",
          "ncm": "84713019",
          "cfop": "5405",
          "unidade": "UN",
          "quantidade": 1.0000,
          "valor_unitario": 60.00,
          "valor_total": 60.00,
          "icms": icmsProduto1
        },
        {
          "codigo": "PROD02",
          "descricao": "Produto com Tributação Normal",
          "ncm": "94032000",
          "cfop": "5102",
          "unidade": "UN",
          "quantidade": 1.0000,
          "valor_unitario": 40.00,
          "valor_total": 40.00,
          "icms": icmsProduto2
        }
      ],
      "pagamentos": [
        { "indicador": 0, "meio": "01", "valor": 40.00 },
        { "indicador": 1, "meio": "99", "valor": 60.00 }
      ],
      "fatura": {
        "numero": "000123",
        "valor_original": 60.00,
        "valor_desconto": 0.00,
        "valor_liquido": 60.00
      },
      "duplicatas": [
        { "numero": "001", "vencimento": "2026-09-28", "valor": 30.00 },
        { "numero": "002", "vencimento": "2026-10-28", "valor": 30.00 }
      ]
    };

    const response = await axios.post('https://api.brasilnfe.com.br/v1/nfe', payload, {
      headers: {
        'UserToken': 'SEU_USER_TOKEN_AQUI',
        'Token': 'SEU_TOKEN_DA_EMPRESA_AQUI',
        'Content-Type': 'application/json'
      }
    });

    console.log(`Nota emitida com sucesso (${regime})!`, response.data);
  } catch (error) {
    console.error("Erro ao emitir nota fiscal:", error.response?.data || error.message);
  }
};

//emitirNotaFiscal('SIMPLES');

module.exports = { emitirNotaFiscal };
