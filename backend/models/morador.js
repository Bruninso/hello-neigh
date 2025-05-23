const mongoose = require('mongoose');

const moradorSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  cpf: { type: String, required: true, unique: true },
  rg: { type: String, required: true, unique: true },
  telefone: { type: String, required: true },
  bloco: { type: String, required: true },
  apartamento: { type: String, required: true },
  sexo: { type: String, required: true },
  nacionalidade: { type: String, required: true },
  nascimento: { type: Date, required: true }       
});

module.exports = mongoose.model('Morador', moradorSchema);
