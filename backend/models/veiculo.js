const mongoose = require('mongoose');

const veiculoSchema = new mongoose.Schema({
  placa: { type: String, required: true, unique: true, uppercase: true, trim: true},
  modeloVeiculo: { type: String, required: true },
  corVeiculo: { type: String, required: true },
  tipoVeiculo: { type: String, required: true, enum: ['carro', 'moto', 'caminhonete'] },
  vaga: { type: String },
  bloco: { type: String, required: true },
  apartamento: { type: String, required: true },
  nomeMorador: { type: String, required: true },
  }, {
  timestamps: true
});

module.exports = mongoose.model('Veiculo', veiculoSchema);