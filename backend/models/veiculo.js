const mongoose = require('mongoose');

const veiculoSchema = new mongoose.Schema({
  placa: { type: String, required: true, unique: true, uppercase: true, trim: true},
  modelo: { type: String, required: true },
  cor: { type: String, required: true },
  tipo: { type: String, required: true },
  vaga: { type: String },
  bloco: { type: String, required: true },
  apartamento: { type: String, required: true },
  moradorResponsavel: { type: String, required: true },
  observacoes: { type: String },
  }, {
  timestamps: true
});

module.exports = mongoose.model('Veiculo', veiculoSchema);