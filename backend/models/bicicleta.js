const mongoose = require('mongoose');

const bicicletaSchema = new mongoose.Schema({
  bikeId: { type: String, required: true, unique: true },
  modelo: { type: String, required: true },
  cor: { type: String, required: true },
  imagem: { type: String },
  status: { type: String, required: true, default: 'DISPONIVEL' },
  localizacao: { type: String, required: true, default: 'CONDOMINIO' },
  bloco: { type: String, required: true },
  apartamento: { type: String, required: true },
  moradorResponsavel: { type: String, required: true },
  }, {
  timestamps: true
});

// Atualizar automaticamente o campo de atualização
bicicletaSchema.pre('save', function(next) {
  this.ultimaAtualizacao = new Date();
  next();
});

module.exports = mongoose.model('Bicicleta', bicicletaSchema);