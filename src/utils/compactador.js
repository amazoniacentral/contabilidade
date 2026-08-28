const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

async function gerarZipContabilidade(dadosDoMes) {
    return new Promise((resolve, reject) => {
        const nomeZip = `Fechamento_Competencia_${dadosDoMes.mes}_${dadosDoMes.ano}.zip`;
        const caminhoSaida = path.join(__dirname, nomeZip);
        
        // Cria o fluxo de escrita para o arquivo ZIP
        const output = fs.createWriteStream(caminhoSaida);
        const archive = archiver('zip', {
            zlib: { level: 9 } // Nível máximo de compactação
        });
          
        output.on('close', function() {
            console.log(`Arquivo ZIP criado com sucesso! Tamanho total: ${archive.pointer()} bytes`);
            resolve(caminhoSaida);
        });
          
        archive.on('error', function(err) {
            reject(err);
        });
          
        // Conecta o arquivador ao stream de saída
        archive.pipe(output);
          
        // 1. Extratos Bancários
        if (dadosDoMes.extratos && dadosDoMes.extratos.length > 0) {
            dadosDoMes.extratos.forEach(filePath => {
                if (fs.existsSync(filePath)) {
                    archive.file(filePath, { name: `1_Extratos_Bancarios/${path.basename(filePath)}` });
                }
            });
        }
          
        // 2. Notas Fiscais de Saída (Vendas da empresa - XML ou PDF)
        if (dadosDoMes.nfsSaida && dadosDoMes.nfsSaida.length > 0) {
            dadosDoMes.nfsSaida.forEach(filePath => {
                if (fs.existsSync(filePath)) {
                    archive.file(filePath, { name: `2_Notas_Fiscais_Saida/${path.basename(filePath)}` });
                }
            });
        }
          
        // 3. Notas de Compras / Aquisição de Mercadorias (XML ou PDF/Nota Impressa de Fornecedores)
        if (dadosDoMes.comprasMercadorias && dadosDoMes.comprasMercadorias.length > 0) {
            dadosDoMes.comprasMercadorias.forEach(filePath => {
                if (fs.existsSync(filePath)) {
                    archive.file(filePath, { name: `3_Notas_Compras_Mercadorias/${path.basename(filePath)}` });
                }
            });
        }

        // 4. Despesas Operacionais e Recibos (Água, luz, aluguel, frete, recibos sem NF, etc.)
        if (dadosDoMes.despesasOperacionais && dadosDoMes.despesasOperacionais.length > 0) {
            dadosDoMes.despesasOperacionais.forEach(filePath => {
                if (fs.existsSync(filePath)) {
                    archive.file(filePath, { name: `4_Despesas_Operacionais/${path.basename(filePath)}` });
                }
            });
        }
          
        // 5. Relatório de Fechamento gerado pelo sistema (Excel / PDF)
        if (dadosDoMes.relatorioBaixasPath && fs.existsSync(dadosDoMes.relatorioBaixasPath)) {
            const nomeRelatorio = path.basename(dadosDoMes.relatorioBaixasPath);
            archive.file(dadosDoMes.relatorioBaixasPath, { name: nomeRelatorio });
        }
          
        // Finaliza a compactação
        archive.finalize();
    });
}

// --- EXEMPLO DE USO ---
const dadosExemplo = {
    mes: "08",
    ano: "2026",
    extratos: [
        path.join(__dirname, 'temp_uploads/extrato_nubank.ofx')
    ],
    nfsSaida: [
        path.join(__dirname, 'temp_uploads/nf_venda_123.xml')
    ],
    // Aqui entram as compras de mercadoria para revenda (seja XML de compra ou a nota de papel que o fornecedor mandou digitalizada em PDF)
    comprasMercadorias: [
        path.join(__dirname, 'temp_uploads/xml_compra_fornecedor_principal.xml'),
        path.join(__dirname, 'temp_uploads/nota_compra_papel_digitalizada.pdf')
    ],
    // Aqui entram as despesas do negócio (contas de consumo, aluguel, recibos de frete, comprovantes de pix)
    despesasOperacionais: [
        path.join(__dirname, 'temp_uploads/conta_luz.pdf'),
        path.join(__dirname, 'temp_uploads/recibo_frete_manual.jpg'),
        path.join(__dirname, 'temp_uploads/comprovante_pix_limpeza.png')
    ],
    relatorioBaixasPath: path.join(__dirname, 'temp_uploads/fechamento_contabil.pdf')
};

// Executando a função de teste (descomente se quiser testar diretamente)
// gerarZipContabilidade(dadosExemplo);

module.exports = { gerarZipContabilidade };
