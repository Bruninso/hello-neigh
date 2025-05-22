const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const moradorRoutes = require('./routes/moradorRoutes');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use('/moradores', moradorRoutes);

mongoose.connect('mongodb://localhost:27017/helloNeighDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Conectado ao MongoDB');
  app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
}).catch(err => console.error('Erro ao conectar no MongoDB:', err));
