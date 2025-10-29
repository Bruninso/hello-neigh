const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const moradorRoutes = require('./routes/moradorRoutes');
const visitanteRoutes = require('./routes/visitanteRoutes');
const veiculoRoutes = require('./routes/veiculoRoutes');
const bicicletaRoutes = require('./routes/bicicletaRoutes');
const petRoutes = require('./routes/petRoutes');
const encomendaRoutes = require('./routes/encomendaRoutes');

const app = express();
const PORT = 3000;

app.use(cors()); // Permite requests do frontend
app.use(express.json()); // Permite receber JSON no body

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cors());
app.use(express.json());
app.use('/moradores', moradorRoutes);
app.use('/visitantes', visitanteRoutes);
app.use('/veiculos', veiculoRoutes);
app.use('/bicicletas', bicicletaRoutes);
app.use('/pets', petRoutes);
app.use('/encomendas', encomendaRoutes);

mongoose.connect('mongodb://localhost:27017/helloNeighDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Conectado ao MongoDB');
  app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
}).catch(err => console.error('Erro ao conectar no MongoDB:', err));
