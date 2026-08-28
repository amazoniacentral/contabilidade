const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();

// --- CONFIGURAÇÃO DE PARSERS ---
app.use(bodyParser.json({ limit: '50mb' })); // Aumentado o limite caso envie arquivos grandes/JSONs extensos
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// --- CONFIGURAÇÃO CORS (Liberado para qualquer origem) ---
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rota de teste simples
app.get('/', (req, res) => {
  res.json({ status: 'Servidor contábil rodando com sucesso!' });
});

// --- EXEMPLO DE ONDE ENTRARIAS AS SUAS ROTAS FUTURAS ---
// const contabilidadeRoutes = require('./routes/contabilidadeRoutes');
// app.use('/api/contabilidade', contabilidadeRoutes);

// --- CONFIGURAÇÃO DA PORTA ---
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
