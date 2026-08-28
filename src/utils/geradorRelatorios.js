const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const PDFDocument = require('pdfkit');

// Dados que vieram do seu JSON
const dadosRecebimentos = [
    {
        data: "2026-08-15",
        nomedocliente: "João da Silva",
        valor: 50.00,
        referencia: "Pagamento parcial - NF 123 e NF 124",
        formadepagamento: "Pix"
    },
    {
        data: "2026-08-16",
        nomedocliente: "Maria Oliveira",
        valor: 120.00,
        referencia: "Quitacao total - NF 130",
        formadepagamento: "Dinheiro"
    },
    {
        data: "2026-08-18",
        nomedocliente: "Carlos Souza",
        valor: 85.50,
        referencia: "Parcela 2/3 - NF 115",
        formadepagamento: "Pix"
    }
];

// Função auxiliar para formatar os dados de forma amigável para exibição
function prepararDadosFormatados(dados) {
    return dados.map(item => ({
        "Data": item.data.split('-').reverse().join('/'), // Converte YYYY-MM-DD para DD/MM/YYYY
        "Cliente": item.nomedocliente,
        "Forma de Pagamento": item.formadepagamento,
        "Referência": item.referencia,
        "Valor (R$)": item.valor
    }));
}

// ==========================================
// 1. GERAR EXCEL (.xlsx)
// ==========================================
function gerarExcel(dados, caminhoSaida) {
    const dadosFormatados = prepararDadosFormatados(dados);
    
    // Cria uma nova planilha do Excel
    const worksheet = XLSX.utils.json_to_sheet(dadosFormatados);
    const workbook = XLSX.utils.book_new();
    
    XLSX.utils.book_append_sheet(workbook, worksheet, "Baixas e Recebimentos");
    
    // Ajuste opcional para largura de colunas (simples)
    worksheet['!cols'] = [
        { wch: 12 }, // Data
        { wch: 25 }, // Cliente
        { wch: 18 }, // Forma
        { wch: 40 }, // Referencia
        { wch: 15 }  // Valor
    ];

    XLSX.writeFile(workbook, caminhoSaida);
    console.log(`[Excel] Arquivo gerado com sucesso: ${caminhoSaida}`);
}

// ==========================================
// 2. GERAR CSV (.csv)
// ==========================================
function gerarCSV(dados, caminhoSaida) {
    const dadosFormatados = prepararDadosFormatados(dados);
    
    const worksheet = XLSX.utils.json_to_sheet(dadosFormatados);
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet, { FS: ";" }); // Usando ponto e vírgula, ótimo para Excel em português
    
    fs.writeFileSync(caminhoSaida, csvOutput, 'utf-8');
    console.log(`[CSV] Arquivo gerado com sucesso: ${caminhoSaida}`);
}

// ==========================================
// 3. GERAR PDF (.pdf)
// ==========================================
function gerarPDF(dados, caminhoSaida) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 30, size: 'A4' });
        const stream = fs.createWriteStream(caminhoSaida);
        
        doc.pipe(stream);

        // Cabeçalho do Relatório
        doc.fillColor('#1e293b').fontSize(16).text('Relatório de Baixas e Recebimentos', { align: 'left' });
        doc.fillColor('#64748b').fontSize(10).text('Competência: Agosto / 2026 | Gerado pelo Sistema', { align: 'left' });
        doc.moveDown(1.5);

        // Tabela - Cabeçalhos
        const startX = 30;
        let startY = doc.y;
        
        doc.fillColor('#334155').rect(startX, startY, 535, 20).fill();
        doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold');
        
        doc.text('Data', startX + 5, startY + 5, { width: 65, align: 'left' });
        doc.text('Cliente', startX + 75, startY + 5, { width: 120, align: 'left' });
        doc.text('Forma', startX + 200, startY + 5, { width: 65, align: 'left' });
        doc.text('Referência / Notas', startX + 270, startY + 5, { width: 180, align: 'left' });
        doc.text('Valor (R$)', startX + 460, startY + 5, { width: 70, align: 'right' });

        startY += 20;
        doc.font('Helvetica').fontSize(9).fillColor('#333333');

        let totalGeral = 0;

        // Linhas de Dados
        dados.forEach((item, index) => {
            totalGeral += item.valor;
            const dataFmt = item.data.split('-').reverse().join('/');
            
            // Zebrado nas linhas
            if (index % 2 === 0) {
                doc.fillColor('#f8fafc').rect(startX, startY, 535, 22).fill();
                doc.fillColor('#333333');
            }

            doc.text(dataFmt, startX + 5, startY + 6, { width: 65 });
            doc.text(item.nomedocliente, startX + 75, startY + 6, { width: 120, lineBreak: false });
            doc.text(item.formadepagamento, startX + 200, startY + 6, { width: 65 });
            doc.text(item.referencia, startX + 270, startY + 6, { width: 180, lineBreak: false });
            doc.text(item.valor.toFixed(2).replace('.', ','), startX + 460, startY + 6, { width: 70, align: 'right' });

            startY += 22;
        });

        // Linha de Totalizador
        startY += 10;
        doc.font('Helvetica-Bold').fontSize(10);
        doc.text(`Total Geral Recebido: R$ ${totalGeral.toFixed(2).replace('.', ',')}`, startX, startY, { align: 'right', width: 535 });

        doc.end();

        stream.on('finish', () => {
            console.log(`[PDF] Arquivo gerado com sucesso: ${caminhoSaida}`);
            resolve(caminhoSaida);
        });

        stream.on('error', (err) => {
            reject(err);
        });
    });
}

// ==========================================
// EXECUÇÃO DO TESTE
// ==========================================
async function executarGeracao() {
    const pastaDestino = path.join(__dirname, 'temp_saida');
    if (!fs.existsSync(pastaDestino)) {
        fs.mkdirSync(pastaDestino);
    }

    const caminhoExcel = path.join(pastaDestino, 'relatorio_recebimentos.xlsx');
    const caminhoCSV = path.join(pastaDestino, 'relatorio_recebimentos.csv');
    const caminhoPDF = path.join(pastaDestino, 'relatorio_recebimentos.pdf');

    // Gera os três arquivos com base na mesma lista de JSON
    gerarExcel(dadosRecebimentos, caminhoExcel);
    gerarCSV(dadosRecebimentos, caminhoCSV);
    await gerarPDF(dadosRecebimentos, caminhoPDF);
}

// Descomente abaixo para testar diretamente executando o arquivo Node:
// executarGeracao();

module.exports = { gerarExcel, gerarCSV, gerarPDF };
