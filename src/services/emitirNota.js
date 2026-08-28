const axios = require('axios');

const emitirNotaFiscal = async (regimeEmpresa = 'SIMPLES') => {
  try {
    // Configura os códigos de ICMS (CSOSN ou CST) dinamicamente com base no regime escolhido
    const regime = regimeEmpresa.toUpperCase();
    
    let icmsProduto1 = { "origem": 0 };
    let icmsProduto2 = { "origem": 0 };

    if (regime === 'NORMAL') {
      icmsProduto1.cst = "60"; // Substituição Tributária para Regime Normal
      icmsProduto2.cst = "00"; // Tributado integralmente para Regime Normal
      icmsProduto2.p_icms = 18.00; // Alíquota de exemplo para o Regime Normal
    } else {
      // MEI ou SIMPLES Nacional usam CSOSN
      icmsProduto1.csosn = "500"; // ICMS pago anteriormente por ST
      icmsProduto2.csosn = "102"; // Tributada sem permissão de crédito
    }

    const payload = {
      "natureza_operacao": "Venda de mercadorias",
      "modelo": "55",
      "finalidade": 1,
      "ambiente": 2, // 2 para Homologação (Testes) | 1 para Produção
      "cliente": {
        "cpf_cnpj": "12345678000199",
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
      // Cada produto possui suas próprias regras de imposto e CFOP
      "produtos": [
        {
          "codigo": "PROD01",
          "descricao": "Produto com Imposto já pago (ST)",
          "ncm": "84713019",
          "cfop": "5405", // CFOP de revenda com ST
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
          "cfop": "5102", // CFOP de venda normal
          "unidade": "UN",
          "quantidade": 1.0000,
          "valor_unitario": 40.00,
          "valor_total": 40.00,
          "icms": icmsProduto2
        }
      ],
      // Pagamento misto: R$ 40,00 no Pix (à vista) + R$ 60,00 a prazo
      "pagamentos": [
        { "indicador": 0, "meio": "17", "valor": 40.00 },
        { "indicador": 1, "meio": "99", "valor": 60.00 }
      ],
      "fatura": {
        "numero": "000123",
        "valor_original": 100.00,
        "valor_desconto": 0.00,
        "valor_liquido": 100.00
      },
      "duplicatas": [
        { "numero": "001", "vencimento": "2026-09-28", "valor": 60.00 }
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

// Passe 'MEI', 'SIMPLES' ou 'NORMAL' ao chamar a função
emitirNotaFiscal('SIMPLES');
