const mongoose = require('mongoose');

const visitanteSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  cpf: { type: String, required: true, unique: true },
  visitado: { type: String, required: true }, // Nome do morador visitado
  bloco: { type: String, required: true },
  apartamento: { type: String, required: true },
  dataRegistro: { type: Date, default: Date.now } // Quando foi registrado
});

module.exports = mongoose.model('Visitante', visitanteSchema);
