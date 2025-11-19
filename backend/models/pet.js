const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  nomePet: { type: String, required: true },
  tipoPet: { type: String, required: true },
  raca: { type: String, required: true },
  porte: { type: String },
  corPet: { type: String },
  bloco: { type: String, required: true },
  apartamento: { type: String, required: true },
  nomeMorador: { type: String, required: true },
  }, {
  timestamps: true
});

module.exports = mongoose.model('Pet', petSchema);