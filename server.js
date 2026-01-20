require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Importar Modelos
const Promotor = require('./models/Promotor');
const RegistroPonto = require('./models/RegistroPonto');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos (Frontend)
app.use(express.static(__dirname));

// Rota raiz para o Frontend (Opcional, pois o static já serve o index.html por padrão, mas garante)
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Conexão MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Conectado ao MongoDB Atlas'))
    .catch(err => console.error('❌ Erro ao conectar no MongoDB:', err));

// --- Rotas da API ---

// 1. Listar Promotores (COM AGREGAÇÃO DE PONTO)
app.get('/api/promotores', async (req, res) => {
    try {
        const promotores = await Promotor.find().sort({ nome: 1 }).lean();

        // Para cada promotor, buscar última entrada e saída
        const promotoresComDados = await Promise.all(promotores.map(async (p) => {
            const ultEntrada = await RegistroPonto.findOne({ promotor: p._id, tipo: 'ENTRADA' })
                .sort({ dataHora: -1 });

            const ultSaida = await RegistroPonto.findOne({ promotor: p._id, tipo: 'SAIDA' })
                .sort({ dataHora: -1 });

            return {
                ...p,
                ultimaEntrada: ultEntrada ? ultEntrada.dataHora : null,
                ultimaSaida: ultSaida ? ultSaida.dataHora : null
            };
        }));

        res.json(promotoresComDados);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao buscar promotores' });
    }
});

// 2. Cadastrar Promotor
app.post('/api/promotores', async (req, res) => {
    try {
        const { nome, marca, cpf } = req.body;

        // Validar CPF duplicado
        const existe = await Promotor.findOne({ cpf });
        if (existe) {
            return res.status(400).json({ erro: 'CPF já cadastrado.' });
        }

        const novoPromotor = new Promotor({ nome, marca, cpf });
        await novoPromotor.save();

        res.status(201).json(novoPromotor);
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao salvar promotor' });
    }
});

// 3. Excluir Promotor
app.delete('/api/promotores/:id', async (req, res) => {
    try {
        await Promotor.findByIdAndDelete(req.params.id);
        await RegistroPonto.deleteMany({ promotor: req.params.id });
        res.json({ mensagem: 'Promotor removido com sucesso' });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao remover promotor' });
    }
});

// 4. Registrar Entrada/Saída
app.post('/api/ponto', async (req, res) => {
    try {
        const { promotorId, tipo } = req.body;

        if (!promotorId || !tipo) {
            return res.status(400).json({ erro: 'Dados incompletos' });
        }

        const novoRegistro = new RegistroPonto({
            promotor: promotorId,
            tipo,
            dataHora: new Date()
        });

        await novoRegistro.save();
        res.status(201).json({ mensagem: 'Ponto registrado com sucesso', registro: novoRegistro });

    } catch (err) {
        console.log(err);
        res.status(500).json({ erro: 'Erro ao registrar ponto' });
    }
});

// 5. Relatórios
app.get('/api/relatorio', async (req, res) => {
    try {
        const { dataInicio, dataFim, filtroTexto } = req.query;
        let query = {};

        if (dataInicio && dataFim) {
            const fim = new Date(dataFim);
            fim.setHours(23, 59, 59, 999);
            query.dataHora = { $gte: new Date(dataInicio), $lte: fim };
        } else if (dataInicio) {
            query.dataHora = { $gte: new Date(dataInicio) };
        }

        let registros = await RegistroPonto.find(query)
            .populate('promotor')
            .sort({ dataHora: -1 });

        if (filtroTexto) {
            const texto = filtroTexto.toLowerCase();
            registros = registros.filter(reg => {
                const p = reg.promotor;
                if (!p) return false;
                return p.nome.toLowerCase().includes(texto) ||
                    p.marca.toLowerCase().includes(texto);
            });
        }

        const resultado = registros.map(reg => ({
            dataHora: reg.dataHora,
            tipo: reg.tipo,
            promotorNome: reg.promotor ? reg.promotor.nome : 'Promotor Removido',
            promotorMarca: reg.promotor ? reg.promotor.marca : '-',
            promotorCpf: reg.promotor ? reg.promotor.cpf : '-'
        }));

        res.json(resultado);

    } catch (err) {
        console.log(err);
        res.status(500).json({ erro: 'Erro ao gerar relatório' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
