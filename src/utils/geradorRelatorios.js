const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const PDFDocument = require('pdfkit');

// Dados estruturados contendo Recebimentos e Despesas
const dadosContabilidade = {
    recebimentos: [
        {
            data: "2026-08-15",
            nomedocliente: "João da Silva",
            valor: 50.00,
            referencia: "Pagamento parcial - NF 123",
            formadepagamento: "Pix"
        },
        {
            data: "2026-08-16",
            nomedocliente: "Maria Oliveira",
            valor: 120.00,
            referencia: "Quitacao total - NF 130",
            formadepagamento: "Dinheiro"
        }
    ],
    despesas: [
        {
            data: "2026-08-10",
            nomefornecedor: "Fornecedor de Insumos Ltda",
            valor: 1500.00,
            tipodocumento: "NF",
            numerodocumento: "452",
            referencia: "Compra de mercadoria",
            formadepagamento: "Boleto"
        },
        {
            data: "2026-08-12",
            nomefornecedor: "João Motoboy (Frete)",
            valor: 80.00,
            tipodocumento: "Recibo / Sem NF",
            numerodocumento: "S/N",
            referencia: "Entrega urgente",
            formadepagamento: "Dinheiro"
        }
    ]
};

// ==========================================
// 1. GERAR EXCEL (.xlsx) - Com 2 Abas (Abas separadas para o contador)
// ==========================================
function gerarExcel(dados, caminhoSaida) {
    const workbook = XLSX.utils.book_new();

    // Aba 1: Recebimentos
    const recFormatados = (dados.recebimentos || []).map(item => ({
        "Data": item.data ? item.data.split('-').reverse().join('/') : '',
        "Cliente": item.nomedocliente,
        "Forma de Pagamento": item.formadepagamento,
        "Referência": item.referencia,
        "Valor (R$)": item.valor
    }));
    const sheetRecebimentos = XLSX.utils.json_to_sheet(recFormatados);
    XLSX.utils.book_append_sheet(workbook, sheetRecebimentos, "Recebimentos");

    // Aba 2: Despesas
    const despFormatadas = (dados.despesas || []).map(item => ({
        "Data": item.data ? item.data.split('-').reverse().join('/') : '',
        "Fornecedor / Favorecido": item.nomefornecedor,
        "Tipo Doc": item.tipodocumento,
        "Nº Doc": item.numerodocumento,
        "Forma de Pagamento": item.formadepagamento,
        "Referência": item.referencia,
        "Valor (R$)": item.valor
    }));
    const sheetDespesas = XLSX.utils.json_to_sheet(despFormatadas);
    XLSX.utils.book_append_sheet(workbook, sheetDespesas, "Despesas");

    XLSX.writeFile(workbook, caminhoSaida);
    console.log(`[Excel] Arquivo gerado com sucesso: ${caminhoSaida}`);
}

// ==========================================
// 2. GERAR CSV (.csv)
// ==========================================
function gerarCSV(dados, caminhoSaida) {
    // Para CSV unificamos as listas de forma simples ou focamos nas receitas/despesas
    const combinado = [
        ...((dados.recebimentos || []).map(i => ({ Tipo: 'RECEBIMENTO', Data: i.data, Nome: i.nomedocliente, Doc: '-', Valor: i.valor, Forma: i.formadepagamento, Ref: i.referencia }))),
        ...((dados.despesas || []).map(i => ({ Tipo: 'DESPESA', Data: i.data, Nome: i.nomefornecedor, Doc: `${i.tipodocumento} ${i.numerodocumento}`, Valor: i.valor, Forma: i.formadepagamento, Ref: i.referencia })))
    ];

    const worksheet = XLSX.utils.json_to_sheet(combinado);
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet, { FS: ";" });
    
    fs.writeFileSync(caminhoSaida, csvOutput, 'utf-8');
    console.log(`[CSV] Arquivo gerado com sucesso: ${caminhoSaida}`);
}

// ==========================================
// 3. GERAR PDF (.pdf) - Completo com Entradas, Saídas e Saldo Líquido
// ==========================================
function gerarPDF(dados, caminhoSaida) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 30, size: 'A4' });
        const stream = fs.createWriteStream(caminhoSaida);
        
        doc.pipe(stream);

        // Cabeçalho
        doc.fillColor('#1e293b').fontSize(16).text('Relatório de Fechamento Contábil', { align: 'left' });
        doc.fillColor('#64748b').fontSize(10).text('Competência: Agosto / 2026 | Entradas e Despesas', { align: 'left' });
        doc.moveDown(1);

        const startX = 30;
        let startY = doc.y;

        // --- SEÇÃO 1: RECEBIMENTOS ---
        doc.fillColor('#0f766e').fontSize(12).font('Helvetica-Bold').text('1. Recebimentos e Entradas', startX, startY);
        startY += 18;

        doc.fillColor('#334155').rect(startX, startY, 535, 18).fill();
        doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold');
        doc.text('Data', startX + 5, startY + 5, { width: 60 });
        doc.text('Cliente', startX + 70, startY + 5, { width: 130 });
        doc.text('Forma', startX + 205, startY + 5, { width: 65 });
        doc.text('Referência', startX + 275, startY + 5, { width: 175 });
        doc.text('Valor (R$)', startX + 455, startY + 5, { width: 75, align: 'right' });

        startY += 18;
        doc.font('Helvetica').fontSize(8).fillColor('#333333');

        let totalRecebimentos = 0;
        (dados.recebimentos || []).forEach((item, index) => {
            totalRecebimentos += item.valor || 0;
            const dataFmt = item.data ? item.data.split('-').reverse().join('/') : '';
            
            if (index % 2 === 0) {
                doc.fillColor('#f8fafc').rect(startX, startY, 535, 18).fill();
                doc.fillColor('#333333');
            }

            doc.text(dataFmt, startX + 5, startY + 4, { width: 60 });
            doc.text(item.nomedocliente || '', startX + 70, startY + 4, { width: 130, lineBreak: false });
            doc.text(item.formadepagamento || '', startX + 205, startY + 4, { width: 65 });
            doc.text(item.referencia || '', startX + 275, startY + 4, { width: 175, lineBreak: false });
            doc.text(Number(item.valor || 0).toFixed(2).replace('.', ','), startX + 455, startY + 4, { width: 75, align: 'right' });

            startY += 18;
        });

        startY += 5;
        doc.font('Helvetica-Bold').fontSize(9).fillColor('#0f766e');
        doc.text(`Total de Recebimentos: R$ ${totalRecebimentos.toFixed(2).replace('.', ',')}`, startX, startY, { align: 'right', width: 535 });
        startY += 25;

        // --- SEÇÃO 2: DESPESAS ---
        doc.fillColor('#991b1b').fontSize(12).font('Helvetica-Bold').text('2. Despesas e Pagamentos (Com e Sem Nota Fiscal)', startX, startY);
        startY += 18;

        doc.fillColor('#334155').rect(startX, startY, 535, 18).fill();
        doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold');
        doc.text('Data', startX + 5, startY + 5, { width: 60 });
        doc.text('Fornecedor', startX + 70, startY + 5, { width: 110 });
        doc.text('Tipo Doc', startX + 185, startY + 5, { width: 75 });
        doc.text('Referência', startX + 265, startY + 5, { width: 185 });
        doc.text('Valor (R$)', startX + 455, startY + 5, { width: 75, align: 'right' });

        startY += 18;
        doc.font('Helvetica').fontSize(8).fillColor('#333333');

        let totalDespesas = 0;
        (dados.despesas || []).forEach((item, index) => {
            totalDespesas += item.valor || 0;
            const dataFmt = item.data ? item.data.split('-').reverse().join('/') : '';
            
            if (index % 2 === 0) {
                doc.fillColor('#fef2f2').rect(startX, startY, 535, 18).fill();
                doc.fillColor('#333333');
            }

            doc.text(dataFmt, startX + 5, startY + 4, { width: 60 });
            doc.text(item.nomefornecedor || '', startX + 70, startY + 4, { width: 110, lineBreak: false });
            doc.text(`${item.tipodocumento} (${item.numerodocumento})`, startX + 185, startY + 4, { width: 75, lineBreak: false });
            doc.text(item.referencia || '', startX + 265, startY + 4, { width: 185, lineBreak: false });
            doc.text(Number(item.valor || 0).toFixed(2).replace('.', ','), startX + 455, startY + 4, { width: 75, align: 'right' });

            startY += 18;
        });

        startY += 5;
        doc.font('Helvetica-Bold').fontSize(9).fillColor('#991b1b');
        doc.text(`Total de Despesas: R$ ${totalDespesas.toFixed(2).replace('.', ',')}`, startX, startY, { align: 'right', width: 535 });
        startY += 30;

        // --- RESUMO / SALDO LÍQUIDO ---
        const saldoLiquido = totalRecebimentos - totalDespesas;
        doc.fillColor('#1e293b').rect(startX, startY, 535, 30).fill();
        doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold');
        doc.text(`SALDO LÍQUIDO DO PERÍODO (Entradas - Saídas): R$ ${saldoLiquido.toFixed(2).replace('.', ',')}`, startX + 10, startY + 10, { width: 515, align: 'center' });

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

    const caminhoExcel = path.join(pastaDestino, 'fechamento_contabil.xlsx');
    const caminhoCSV = path.join(pastaDestino, 'fechamento_contabil.csv');
    const caminhoPDF = path.join(pastaDestino, 'fechamento_contabil.pdf');

    gerarExcel(dadosContabilidade, caminhoExcel);
    gerarCSV(dadosContabilidade, caminhoCSV);
    await gerarPDF(dadosContabilidade, caminhoPDF);
}

// Descomente abaixo para testar diretamente:
// executarGeracao();

module.exports = { gerarExcel, gerarCSV, gerarPDF };
