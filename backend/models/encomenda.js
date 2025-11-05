const mongoose = require('mongoose');

const encomendaSchema = new mongoose.Schema({
  nomeMorador: { type: String, required: true },
  recebidaPor: { type: String, required: true },
  bloco: { type: String, required: true },
  apartamento: { type: String, required: true},
  transportadora: { type: String, required: true },
  }, {
  timestamps: true
});

module.exports = mongoose.model('Encomenda', encomendaSchema);