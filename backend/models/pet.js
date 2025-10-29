const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  tipo: { type: String, required: true },
  raca: { type: String },
  porte: { type: String },
  cor: { type: String },
  imagem: { type: String },
  dataNascimento: { type: Date },
  vacinado: { type: Boolean, default: false },
  castrado: { type: Boolean, default: false },
  observacoes: { type: String },
  bloco: { type: String, required: true },
  apartamento: { type: String, required: true },
  moradorResponsavel: { type: String, required: true },
  }, {
  timestamps: true
});

module.exports = mongoose.model('Pet', petSchema);