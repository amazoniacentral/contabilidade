const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

async function gerarZipContabilidade(dadosDoMes) {
    const nomeZip = `Fechamento_Competencia_${dadosDoMes.mes}_${dadosDoMes.ano}.zip`;
    const caminhoSaida = path.join(__dirname, nomeZip);
    
    // Cria o fluxo de escrita para o arquivo ZIP
    const output = fs.createWriteStream(caminhoSaida);
    const archive = archiver('zip', {
        zlib: {
          level: 9 // Nível máximo de compactação }
        });
      
      output.on('close', function() {
        console.log(`Arquivo ZIP criado com sucesso! Tamanho total: ${archive.pointer()} bytes`);
      });
      
      archive.on('error', function(err) {
        throw err;
      });
      
      // Conecta o arquivador ao stream de saída
      archive.pipe(output);
      
      // 1. Adicionar Extratos Bancários na pasta correspondente
      // (Exemplo: arquivos que o usuário subiu no sistema)
      if (dadosDoMes.extratos && dadosDoMes.extratos.length > 0) {
        dadosDoMes.extratos.forEach(extratoPath => {
          if (fs.existsSync(extratoPath)) {
            archive.file(extratoPath, { name: `1_Extratos_Bancarios/${path.basename(extratoPath)}` });
          }
        });
      }
      
      // 2. Adicionar Notas Fiscais de Saída (Vendas)
      if (dadosDoMes.nfsSaida && dadosDoMes.nfsSaida.length > 0) {
        dadosDoMes.nfsSaida.forEach(xmlPath => {
          if (fs.existsSync(xmlPath)) {
            archive.file(xmlPath, { name: `2_Notas_Fiscais_Saida/${path.basename(xmlPath)}` });
          }
        });
      }
      
      // 3. Adicionar Notas Fiscais de Compra
      if (dadosDoMes.nfsCompras && dadosDoMes.nfsCompras.length > 0) {
        dadosDoMes.nfsCompras.forEach(xmlPath => {
          if (fs.existsSync(xmlPath)) {
            archive.file(xmlPath, { name: `3_Notas_Fiscais_Compras/${path.basename(xmlPath)}` });
          }
        });
      }
      
      // 4. Adicionar o Relatório de Baixas gerado pelo sistema (PDF ou Excel)
      if (dadosDoMes.relatorioBaixasPath && fs.existsSync(dadosDoMes.relatorioBaixasPath)) {
        const nomeRelatorio = path.basename(dadosDoMes.relatorioBaixasPath);
        archive.file(dadosDoMes.relatorioBaixasPath, { name: nomeRelatorio });
      }
      
      // Finaliza a compactação
      await archive.finalize();
    }
    
    // --- EXEMPLO DE USO ---
    const dadosExemplo = {
      mes: "08",
      ano: "2026",
      extratos: [
        // Caminhos temporários dos arquivos enviados pelo usuário no sistema
        path.join(__dirname, 'temp_uploads/extrato_nubank.ofx'),
        path.join(__dirname, 'temp_uploads/extrato_openpix.ofx')
      ],
      nfsSaida: [
        path.join(__dirname, 'temp_uploads/nf_123.xml'),
        path.join(__dirname, 'temp_uploads/nf_124.xml')
      ],
      nfsCompras: [
        path.join(__dirname, 'temp_uploads/compra_fornecedor.xml')
      ],
      relatorioBaixasPath: path.join(__dirname, 'temp_uploads/relatorio_recebimentos.pdf')
    };
    
    // Executando a função de teste
    // gerarZipContabilidade(dadosExemplo);